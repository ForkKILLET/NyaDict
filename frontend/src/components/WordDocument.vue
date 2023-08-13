<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import {
    DocumentKind,
    type IWordDocumentWithoutId, type IWord
} from '@type'
import NyaConfirmInput from '@comp/NyaConfirmInput.vue'
import NyaTemplate from '@comp/NyaTemplate.vue'
import WordDocumentList from '@comp/WordDocumentList.vue'
import WordMiniSearcher from '@comp/WordMiniSearcher.vue'
import WordLinkRelationship from './WordLinkRelationship.vue'

const props = defineProps<{
    word: IWord
    doc: IWordDocumentWithoutId
    editMode?: boolean
}>()

const emit = defineEmits<{
    (event: 'withdraw'): void
}>()

const lang = computed(() => 'lang' in props.doc
    ? (props.doc.lang ?? navigator.language)
    : undefined
)

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
    model.value += word.id
    templateInput.value!.focus()
}
const sharpCancel = () => {
    showMiniSearcher.value = false
    templateInput.value!.focus()
}
const onTemplateCompositionEnd = (event: CompositionEvent) => {
    if (event.data === '#') sharpStart()
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
                :edit-mode="editMode"
            />
        </div>

        <WordDocumentList :word="word" :node="doc" />
    </div>
    <div v-else-if="doc.kind === DocumentKind.Sentence || doc.kind === DocumentKind.Link" class="template-doc">
        <div>
            <NyaConfirmInput
                v-model="doc.text"
                @withdraw="emit('withdraw')"
                :more="true"
                :withdraw-when-empty="true"
                :withdrawable="true"
                :edit-mode="editMode"
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
