<script setup lang="ts">
import { useWord } from '@store/words'
import WordDocument from '@comp/WordDocument.vue'
import WordDocumentAdder from '@comp/WordDocumentAdder.vue'
import type { IWord, IWordDocument, IWordDocumentWithoutId } from '@type'

const props = defineProps<{
    doc: IWordDocument
    word: IWord
}>()

const emit = defineEmits<{
    (event: 'withdraw'): void
}>()

const wordStore = useWord()


const addDoc = (newDoc: IWordDocumentWithoutId) => {
    if ('docs' in props.doc) wordStore.addDoc(props.doc.docs ??= [], newDoc)
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
