<script setup lang="ts">
import { computed } from 'vue'
import { DocumentKind, type IWordDocumentWithoutId, type IWord } from '@type'
import NyaConfirmInput from '@comp/NyaConfirmInput.vue'
import WordDocumentList from '@comp/WordDocumentList.vue'
import Sentence from './Sentence.vue';

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
</script>

<template>
    <div v-if="doc.kind === DocumentKind.Meaning" class="meaning-doc">
        <div class="meaning-doc-text card" :lang="lang">
            <NyaConfirmInput
                v-model="doc.text"
                @withdraw="emit('withdraw')"
                :withdrawable="actionMode"
                :edit-mode="editMode"
                :autofocus="true"
            />
        </div>

        <WordDocumentList :word="word" :node="doc" :action-mode="actionMode" />
    </div>
    <div v-else-if="doc.kind === DocumentKind.Sentence" class="setence-doc">
        <div>
            <NyaConfirmInput
                v-model="doc.text"
                @withdraw="emit('withdraw')"
                :withdrawable="actionMode"
                :edit-mode="editMode"
                :autofocus="true"
            >
                <template #content>
                    <Sentence :text="doc.text" :word="word" />
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
    margin: 1em .8em 1em 0;
}

.doc-list {
    margin-left: 1em;
}

.nya-confirm-input :deep(input) {
    width: calc(100% - 4rem);
}
</style>
