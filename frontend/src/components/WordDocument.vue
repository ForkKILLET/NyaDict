<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'

import { useWord, getFirstWordTemplateSegment } from '@store/words'

import NyaConfirmInput from '@comp/NyaConfirmInput.vue'
import NyaTemplate from '@comp/NyaTemplate.vue'
import WordDocumentList from '@comp/WordDocumentList.vue'
import WordMiniSearcher from '@comp/WordMiniSearcher.vue'
import WordLinkRelationship from '@comp/WordLinkRelationship.vue'
import LongPressButton from '@comp/LongPressButton.vue'

import { addNoti } from '@/utils/notif'

import { DocumentKind } from '@type'
import type { IWordDocument, IWord, ITemplateDocument, ILinkDocument } from '@type'

const props = defineProps<{
    word: IWord
    doc: IWordDocument
}>()

const emit = defineEmits<{
    (event: 'withdraw'): void
}>()

const wordStore = useWord()

const lang = computed(() => 'lang' in props.doc
    ? (props.doc.lang ?? navigator.language)
    : undefined
)

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
    if (el) {
        const pos = el.selectionStart
        if (pos !== null) {
            if (model.value[pos - 1] === '#') {
                const id = String(word.id)
                model.value = model.value.slice(0, pos) + id + model.value.slice(pos)
                nextTick(() => {
                    el.selectionStart = el.selectionEnd = pos + id.length
                })
            }
        }
    }
}
const sharpCancel = () => {
    showMiniSearcher.value = false
    templateInput.value!.focus()
}
const onTemplateCompositionEnd = (event: CompositionEvent) => {
    if (event.data === '#') sharpStart()
}
const updateGraph = (doc: ITemplateDocument, reversed: boolean) => {
    wordStore.updateGraphByTemplate(doc.id, doc.text, props.word, props.word.id, reversed)
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
        wordStore.updateGraphByTemplate(newDocId, newDoc.text, targetWord, targetId, false)
        addNoti({
            content: 'バックリンクを作成しました',
            type: 'success',
            duration: 2 * 1000
        })
    }
}
</script>

<template>
    <div v-if="doc.kind === DocumentKind.Meaning" class="meaning-doc">
        <div class="meaning-doc-text card" :lang="lang">
            <NyaConfirmInput
                v-model="doc.text"
                @withdraw="emit('withdraw')"
                :more="true"
                :withdrawable="true"
                :withdraw-when-empty="true"
                :edit-mode="newlyAdded"
            />
        </div>

        <WordDocumentList :word="word" :node="doc" />
    </div>
    <div v-else-if="doc.kind === DocumentKind.Sentence || doc.kind === DocumentKind.Link" class="template-doc">
        <div>
            <NyaConfirmInput
                v-model="doc.text"
                @before-update:modelValue="updateGraph(doc, true)"
                @update:modelValue="updateGraph(doc, false)"
                @withdraw="updateGraph(doc, true); emit('withdraw')"
                :more="true"
                :withdraw-when-empty="true"
                :withdrawable="true"
                :edit-mode="newlyAdded"
            >
                <template #content>
                    <div class="template-doc-content">
                        <WordLinkRelationship
                            v-if="doc.kind === DocumentKind.Link"
                            :rel="doc.rel"
                        />
                        <NyaTemplate :text="doc.text" :word="word" />
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
                        @keypress.#="sharpStart"
                        @compositionend="onTemplateCompositionEnd"
                    />
                </template>
                <template #more>
                    <LongPressButton
                        v-if="doc.kind === DocumentKind.Link"
                        @long-press="backlink(doc)"
                        icon="link"
                        color="#000"
                        desc="バックリンク"
                        :delay=".5"
                    />
                </template>
            </NyaConfirmInput>
        </div>
    </div>
</template>

<style scoped>
.meaning-doc {
    margin-bottom: .5em;
}

.meaning-doc-text {
    margin-bottom: .5em;
}

.template-doc {
    position: relative;
    margin: .8em .8em .8em 0;
}

.template-doc-content {
    display: flex;
}

.word-mini-searcher {
    position: absolute;
    bottom: calc(100% + 1em);
    width: 100%;
}
</style>
