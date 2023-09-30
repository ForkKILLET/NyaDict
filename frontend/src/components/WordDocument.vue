<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { storeToRefs } from 'pinia'

import { useWord, getFirstWordTemplateSegment } from '@store/words'
import { useConfig } from '@store/config'

import NyaConfirmInput from '@comp/NyaConfirmInput.vue'
import NyaTemplate from '@comp/NyaTemplate.vue'
import WordDocumentList from '@comp/WordDocumentList.vue'
import WordMiniSearcher from '@comp/WordMiniSearcher.vue'
import WordLinkRelationship from '@comp/WordLinkRelationship.vue'
import LongPressButton from '@comp/LongPressButton.vue'

import { addNoti } from '@util/notif'

import { DocumentKind } from '@type'
import type { IWordDocument, IWord, ITemplateDocument, ILinkDocument } from '@type'
import WordDocumentLabels from '@comp/WordDocumentLabels.vue'

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

const showMiniSearcher = ref(false)
const miniSearcher = ref<InstanceType<typeof WordMiniSearcher>>()
const templateInput = ref<HTMLInputElement>()
const sharpStart = () => {
    showMiniSearcher.value = true
    nextTick(() => {
        miniSearcher.value?.focus()
    })
}

const sharpEnd = (word: IWord, model: { value: string }) => {
    showMiniSearcher.value = false
    templateInput.value!.focus()

    const el = templateInput.value
    if (! el) return

    const pos = el.selectionStart
    if (typeof pos === 'number' && el.value[pos - 1] === '#') {
        const id = String(word.id)
        model.value = model.value.slice(0, pos) + id + model.value.slice(pos)
        nextTick(() => {
            const el = templateInput.value
            if (el) el.selectionStart = el.selectionEnd = pos + id.length
        })
    }
}
const sharpCancel = () => {
    showMiniSearcher.value = false
    templateInput.value!.focus()
}
const onSharp = () => {
    if (! config.value.lazySharp) sharpStart()
}
const onTab = () => {
    const el = templateInput.value
    if (! el) return

    const pos = el.selectionStart
    if (typeof pos === 'number' && el.value[pos - 1] === '#') {
        sharpStart()
    }
}
const onTemplateCompositionEnd = (event: CompositionEvent) => {
    if (event.data === '#' && ! config.value.lazySharp) sharpStart()
}
const oldDocText = ref(props.doc.text)
const updateGraph = (newDocText: string) => {
    wordStore.updateGraphByTemplate(props.doc.id, oldDocText.value, newDocText, props.word, props.word.id)
}

const backlink = (doc: ILinkDocument) => {
    const target = getFirstWordTemplateSegment(doc.text)
    if (! target?.id) return

    const targetId = target.id
    const targetWord = wordStore.getById(targetId)
    if (! targetWord) return

    const backlinkDoc = targetWord.docs?.find(doc => {
        if (doc.kind !== DocumentKind.Link) return false
        const target = getFirstWordTemplateSegment(doc.text)
        if (target?.id !== props.word.id) return false
        return true
    })

    if (backlinkDoc) addNoti({
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
        const newDocId = wordStore.addDoc(targetWord.docs ??= [], newDoc)
        wordStore.updateGraphByTemplate(newDocId, '', newDoc.text, targetWord, targetId, false)
        addNoti({
            content: 'バックリンクを作成しました',
            type: 'success',
            duration: 2 * 1000
        })
    }
}
</script>

<template>
    <div class="word-doc" :class="{
        'meaning-doc': doc.kind === DocumentKind.Meaning,
        'template-doc': doc.kind === DocumentKind.Sentence || doc.kind === DocumentKind.Link,
    }">
        <template v-if="doc.kind === DocumentKind.Meaning">
            <div
                class="meaning-doc-main card"
                :class="{ barber: doc.labels?.i }"
                :lang="lang"
            >
                <NyaConfirmInput
                    v-model="doc.text"
                    @withdraw="emit('withdraw')"
                    :more="true"
                    :withdrawable="true"
                    :withdraw-when-empty="true"
                    :edit-mode="newlyAdded"
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
            <div class="template-doc-main" :class="{ barber: doc.labels?.i }">
                <NyaConfirmInput
                    v-model="doc.text"
                    @before-update:modelValue="oldDocText = doc.text"
                    @update:modelValue="updateGraph(doc.text)"
                    @withdraw="updateGraph(''); emit('withdraw')"
                    :more="true"
                    :withdraw-when-empty="true"
                    :withdrawable="true"
                    :edit-mode="newlyAdded"
                    :disabled="hideSelf"
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
                    <template #input="{ model, submit }">
                        <WordLinkRelationship
                            v-if="doc.kind === DocumentKind.Link"
                            v-model:rel="doc.rel"
                            :edit-mode="true"
                        />
                        <WordMiniSearcher
                            v-if="showMiniSearcher"
                            ref="miniSearcher"
                            @select-word="word => sharpEnd(word, model.ref)"
                            @cancel="sharpCancel"
                        />
                        <input
                            class="input"
                            ref="templateInput"
                            v-model="model.ref.value"
                            @keypress.enter="submit"
                            @keypress.#="onSharp"
                            @keydown.tab.prevent="onTab"
                            @compositionend="onTemplateCompositionEnd"
                        />
                    </template>
                    <template #more>
                        <LongPressButton
                            v-if="doc.kind === DocumentKind.Link"
                            @long-press="backlink(doc)"
                            icon="link"
                            color="var(--color-fg)"
                            desc="バックリンク"
                            :delay=".5"
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
