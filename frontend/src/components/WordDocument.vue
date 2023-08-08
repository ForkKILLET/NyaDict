<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { DocumentKind, type IWordDocumentWithoutId, type IWord } from '@type'
import NyaConfirmInput from '@comp/NyaConfirmInput.vue'
import WordDocumentList from '@comp/WordDocumentList.vue'
import Sentence from '@comp/Sentence.vue'
import WordMiniSearcher from '@comp/WordMiniSearcher.vue'

const props = defineProps<{
    word: IWord
    doc: IWordDocumentWithoutId
    editMode?: boolean
    actionMode: boolean
}>()

const emit = defineEmits<{
    (event: 'withdraw'): void
}>()

const lang = computed(() => props.doc.lang ?? navigator.language)

const showMiniSearcher = ref(false)
const miniSearcher = ref<InstanceType<typeof WordMiniSearcher>>()
const sentenceInput = ref<HTMLInputElement>()
const sharpStart = () => {
    showMiniSearcher.value = true
    nextTick(() => {
        miniSearcher.value?.focus()
    })
}
const sharpEnd = (word: IWord, model: { value: string }) => {
    showMiniSearcher.value = false
    model.value += word.id
    sentenceInput.value!.focus()
}
const sharpCancel = () => {
    showMiniSearcher.value = false
    sentenceInput.value!.focus()
}
const onSentenceCompositionEnd = (event: CompositionEvent) => {
    if (event.data === '#') sharpStart()
}
</script>

<template>
    <div v-if="doc.kind === DocumentKind.Meaning" class="meaning-doc">
        <div class="meaning-doc-text card" :lang="lang">
            <NyaConfirmInput
                v-model="doc.text"
                @withdraw="emit('withdraw')"
                :withdrawable="actionMode"
                :withdraw-when-empty="true"
                :edit-mode="editMode"
            />
        </div>

        <WordDocumentList :word="word" :node="doc" :action-mode="actionMode" />
    </div>
    <div v-else-if="doc.kind === DocumentKind.Sentence" class="setence-doc">
        <div>
            <NyaConfirmInput
                v-model="doc.text"
                @withdraw="emit('withdraw')"
                :withdraw-when-empty="true"
                :withdrawable="actionMode"
                :edit-mode="editMode"
            >
                <template #content>
                    <Sentence :text="doc.text" :word="word" />
                </template>
                <template #input="{ model, submit }">
                    <WordMiniSearcher
                        v-if="showMiniSearcher"
                        ref="miniSearcher"
                        @select-word="word => sharpEnd(word, model.ref)"
                        @cancel="sharpCancel"
                    />
                    <input
                        class="input"
                        ref="sentenceInput"
                        v-model="model.ref.value"
                        @keypress.enter="submit"
                        @keypress.#="sharpStart"
                        @compositionend="onSentenceCompositionEnd"
                    />
                </template>
            </NyaConfirmInput>
        </div>
    </div>
</template>

<style scoped>
.meaning-doc {
    margin-bottom: 1em;
}

.meaning-doc-text {
    margin-bottom: .5em;
}

.setence-doc {
    position: relative;
    margin: 1em .8em 1em 0;
    padding: 0 .3em;
}

.doc-list {
    margin-left: 1em;
}

.nya-confirm-input :deep(.input) {
    width: 0;
    flex: 1;
}

.word-mini-searcher {
    position: absolute;
    bottom: calc(100% + 1em);
    width: 100%;
}
</style>
