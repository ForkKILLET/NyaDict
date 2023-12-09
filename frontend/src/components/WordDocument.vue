<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { storeToRefs } from 'pinia'

import { useWord, getFirstWordTemplateSegment, getHiragana, getWordSentenceSegements } from '@store/words'
import { useConfig } from '@store/config'

import NyaConfirmInput, { type InputCtx } from '@comp/NyaConfirmInput.vue'
import NyaTemplate from '@comp/NyaTemplate.vue'
import MiniSearcher, { type MiniList } from '@comp/MiniSearcher.vue'
import WordDocumentList from '@comp/WordDocumentList.vue'
import WordLinkRelationship from '@comp/WordLinkRelationship.vue'
import LongPressButton from '@comp/LongPressButton.vue'
import WordDocumentLabels from '@comp/WordDocumentLabels.vue'

import { dedup, filterN } from '@util'
import { addNoti } from '@util/notif'
import { strictToHiragana } from '@util/kana'

import { DocumentKind } from '@type'
import type { IWordDocument, IWord, ILinkDocument } from '@type'
import type { GenericComponentInstanceType } from '@type/tool'

const props = defineProps<{
    word: IWord
    doc: IWordDocument
    hideSelf?: boolean
}>()

const emit = defineEmits<{
    (event: 'withdraw'): void
}>()

const wordStore = useWord()
const { config } = storeToRefs(useConfig())

const lang = computed(() => navigator.language)

const newlyAdded = ref(false)
if (wordStore.newlyAddedDocId === props.doc.id) {
    newlyAdded.value = true
    wordStore.newlyAddedDocId = undefined
}

const showWordMiniSearcher = ref(false)
const showDispMiniSearcher = ref(false)
const miniSearcher = ref<GenericComponentInstanceType<typeof MiniSearcher>>()
const templateInput = ref<HTMLInputElement>()

const getInputState = () => {
    const el = templateInput.value
    if (! el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const value = el.value
    return {
        el, start, end, value,
        currChar: start !== null && start === end ? value[start - 1] : null
    }
}

const onKey = (key: string, inputCtx: InputCtx) => {
    if (key === '#') {
        onSharp()
    }
    else if (key === '(') {
        setTimeout(() => onParen(inputCtx), 0)
    }
    else if (key === 'Enter') {
        inputCtx.submit()
    }
}
const onTab = () => {
    const state = getInputState()
    if (! state) return

    const { currChar } = state
    if (currChar === '#') wordCompStart()
    else if(currChar === '(') dispCompStart()
}
const onSharp = () => {
    if (! config.value.lazyCompletion) wordCompStart()
}
const onParen = (inputCtx: InputCtx) => {
    if (config.value.autoParen) {
        insertContentAfter(
            '(', ')', { overwrite: false, moveCursor: false }, inputCtx.model.ref
        )
    }
    if (! config.value.lazyCompletion) dispCompStart()
}

const wordCompStart = () => {
    showWordMiniSearcher.value = true
    nextTick(() => {
        miniSearcher.value?.focus()
    })
}
const dispCompStart = () => {
    const state = getInputState()
    if (! state) return
    const { value, start, end } = state
    if (start === null || start !== end || value.slice(start - 2, start) !== '#(') return

    showDispMiniSearcher.value = true
    nextTick(() => {
        miniSearcher.value?.focus()
    })
}

const insertContentAfter = (
    baseChar: string,
    content: string,
    option: {
        overwrite: boolean
        moveCursor: boolean
    },
    model: { value: string }
) => {
    const state = getInputState()
    if (! state) return

    const { el, value, start, currChar } = state
    el.focus()

    if (start !== null && currChar === baseChar) {
        const realStart = option.overwrite ? start - 1 : start
        model.value = value.slice(0, realStart) + content + model.value.slice(start)
        nextTick(() => {
            const newCursorPos = option.moveCursor ? realStart + content.length : realStart
            el.selectionStart = el.selectionEnd = newCursorPos
        })
    }
}
const wordCompEnd = (word: IWord, { model }: InputCtx) => {
    showWordMiniSearcher.value = false

    const state = getInputState()
    if (! state) return

    state.el.focus()
    insertContentAfter(
        '#', String(word.id), { overwrite: false, moveCursor: true }, model.ref
    )
}
const dispCompEnd = (disp: string, { model }: InputCtx) => {
    showDispMiniSearcher.value = false

    const state = getInputState()
    if (! state) return

    state.el.focus()
    insertContentAfter(
        '(', disp, { overwrite: false, moveCursor: true }, model.ref
    )
}
const wordCompCancel = (content: string | undefined, { model }: InputCtx) => {
    showWordMiniSearcher.value = false

    const state = getInputState()
    if (! state) return

    state.el.focus()
    if (! content) return
    insertContentAfter(
        '#', content, { overwrite: true, moveCursor: true }, model.ref
    )
}
const dispCompCancel = (content: string | undefined, { model }: InputCtx) => {
    showDispMiniSearcher.value = false

    const state = getInputState()
    if (! state) return

    state.el.focus()
    if (! content) return
    insertContentAfter(
        '(', content, { overwrite: false, moveCursor: true }, model.ref
    )
}

const getWordMiniList = (search: string): MiniList<IWord> => {
    if (! search) return []

    const hiragana = strictToHiragana(search)

    const words = filterN(
        wordStore.words, 4,
        hiragana
            ? word => (getHiragana(word).startsWith(hiragana))
            : word => word.disp.startsWith(search) || word.sub.startsWith(search)
    )

    return words
        .sort((a, b) => a.disp.length - b.disp.length)
        .map(word => ({
            display: word.disp,
            value: word
        }))
}
const wordDisps = computed(() => {
    const { word } = props
    return dedup([
        word.disp,
        ...getWordSentenceSegements(word)
            .flat()
            .filter((seg): seg is { id: undefined, disp: string } => typeof seg === 'object' && ! seg.id && !! seg.disp)
            .map(seg => seg.disp)
    ], (a, b) => a === b)
})
const getDispMiniList = (search: string): MiniList<string> => {
    const disps = wordDisps.value
    return (
        search === '' ? disps : disps.filter(disp => disp.startsWith(search))
    ).map(disp => ({ display: disp, value: disp }))
}

const oldDocText = ref(props.doc.text)
const updateGraph = (newDocText: string) => {
    wordStore.updateGraphByTemplate(props.doc.id, oldDocText.value, newDocText, props.word, props.word.id)
}

const backlinkInfo = computed(() => {
    if (props.doc.kind !== DocumentKind.Link) return

    const target = getFirstWordTemplateSegment(props.doc.text)
    if (! target?.id) return

    const targetId = target.id
    const targetWord = wordStore.getById(targetId)

    if (! targetWord) return

    const backDoc = targetWord.docs?.find(doc => {
        if (doc.kind !== DocumentKind.Link) return false
        const target = getFirstWordTemplateSegment(doc.text)
        if (target?.id !== props.word.id) return false
        return true
    })

    return {
        targetWord,
        backDoc
    }
})

const backlink = (doc: ILinkDocument) => {
    const info = backlinkInfo.value
    if (! info) return

    if (info.backDoc) addNoti({
        content: 'バックリンクは既に存在します',
        type: 'info',
        duration: 2 * 1000
    })

    else {
        const newDoc: Omit<ILinkDocument, 'id'> = {
            kind: DocumentKind.Link,
            text: '#' + props.word.id,
            rel: doc.rel
        }
        const newDocId = wordStore.addDoc(info.targetWord.docs ??= [], newDoc)
        wordStore.updateGraphByTemplate(newDocId, '', newDoc.text, info.targetWord, info.targetWord.id, false)
        addNoti({
            content: 'バックリンクを作成しました',
            type: 'success',
            duration: 2 * 1000
        })
    }
}
</script>

<template>
    <div
        class="word-doc"
        :class="{
            'meaning-doc': doc.kind === DocumentKind.Meaning,
            'template-doc': doc.kind === DocumentKind.Sentence || doc.kind === DocumentKind.Link,
        }"
    >
        <template v-if="doc.kind === DocumentKind.Meaning">
            <div
                class="meaning-doc-main card"
                :class="{ barber: doc.labels?.i }"
                :lang="lang"
            >
                <NyaConfirmInput
                    v-model="doc.text"
                    :more="true"
                    :withdrawable="true"
                    :withdraw-when-empty="true"
                    :edit-mode="newlyAdded"
                    @withdraw="emit('withdraw')"
                >
                    <template #more>
                        <WordDocumentLabels :doc="doc" />
                    </template>
                </NyaConfirmInput>
            </div>

            <WordDocumentList
                :word="word"
                :node="doc"
                :hide-self="hideSelf"
            />
        </template>
        <template v-else-if="doc.kind === DocumentKind.Sentence || doc.kind === DocumentKind.Link">
            <div
                class="template-doc-main"
                :class="{ barber: doc.labels?.i }"
            >
                <NyaConfirmInput
                    v-model="doc.text"
                    :more="true"
                    :withdraw-when-empty="true"
                    :withdrawable="true"
                    :edit-mode="newlyAdded"
                    :disabled="hideSelf"
                    @before-update:model-value="oldDocText = doc.text"
                    @update:model-value="updateGraph(doc.text)"
                    @withdraw="updateGraph(''); emit('withdraw')"
                >
                    <template #content>
                        <div class="content">
                            <WordLinkRelationship
                                v-if="doc.kind === DocumentKind.Link"
                                v-model:rel="doc.rel"
                                :edit-mode="true"
                            />
                            <NyaTemplate
                                :text="doc.text"
                                :word="word"
                                :hide-self="hideSelf"
                                :short="doc.kind === DocumentKind.Sentence"
                            />
                        </div>
                    </template>
                    <template #input="inputCtx">
                        <WordLinkRelationship
                            v-if="doc.kind === DocumentKind.Link"
                            v-model:rel="doc.rel"
                            :edit-mode="true"
                        />
                        <MiniSearcher
                            v-if="showWordMiniSearcher"
                            ref="miniSearcher"
                            :get-list="getWordMiniList"
                            @select="word => wordCompEnd(word, inputCtx)"
                            @cancel="value => wordCompCancel(value, inputCtx)"
                        />
                        <MiniSearcher
                            v-if="showDispMiniSearcher"
                            ref="miniSearcher"
                            :get-list="getDispMiniList"
                            @select="disp => dispCompEnd(disp, inputCtx)"
                            @cancel="value => dispCompCancel(value, inputCtx)"
                        />
                        
                        <input
                            ref="templateInput"
                            v-model="inputCtx.model.ref.value"
                            class="input"
                            @keypress="event => onKey(event.key, inputCtx)"
                            @compositionend="event => onKey(event.data, inputCtx)"
                            @keydown.tab.prevent="onTab()"
                        >
                    </template>
                    <template #more>
                        <LongPressButton
                            v-if="doc.kind === DocumentKind.Link"
                            icon="link"
                            :color="backlinkInfo?.backDoc ? 'var(--color-order)' : 'var(--color-fg)'"
                            desc="バックリンク"
                            :delay=".5"
                            @long-press="backlink(doc)"
                        />
                        <WordDocumentLabels :doc="doc" />
                    </template>
                </NyaConfirmInput>
            </div>
        </template>
    </div>
</template>

<style scoped>
.word-doc {
    position: relative;
}

.meaning-doc {
    margin-bottom: .5em;
}

.meaning-doc-main {
    margin-bottom: .5em;
}

.template-doc {
    position: relative;
    margin: .8em .8em .8em 0;
}

.template-doc-main {
    margin: -.3em;
    padding: .3em;
    border-radius: .5em;
}

.template-doc .content {
    display: flex;
}

.word-mini-searcher {
    position: absolute;
    bottom: calc(100% + 1em);
    width: 100%;
}
</style>
