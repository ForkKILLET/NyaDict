<script setup lang="ts">
import { useWord } from '@store/words'
import WordDocument from '@comp/WordDocument.vue'
import WordDocumentAdder from '@comp/WordDocumentAdder.vue'
import type { IWord, IWordDocument, IWordDocumentWithoutId } from '@type'

const props = defineProps<{
    doc: IWordDocument
    word: IWord
    hideSelf?: boolean
}>()

const emit = defineEmits<{
    (event: 'withdraw'): void
}>()

const wordStore = useWord()


const addDoc = (newDoc: IWordDocumentWithoutId) => {
    if ('docs' in props.doc) {
        const id = wordStore.addDoc(props.doc.docs ??= [], newDoc)
        wordStore.newlyAddedDocId = id
    }
}
</script>

<template>
    <div class="doc-entry">
        <div class="doc-sidebar">
            <WordDocumentAdder @add-doc="addDoc" v-if="'docs' in doc" />
        </div>
        <WordDocument
            class="doc"
            @withdraw="emit('withdraw')"
            :key="doc.id"
            :word="word"
            :doc="doc"
            :hide-self="hideSelf"
        />
    </div>
</template>

<style scoped>
.doc-entry {
    display: flex;
}

.doc-sidebar {
    flex-basis: 1.5em;
    margin-top: .7em;
}

.doc {
    flex: 1;
}
</style>
