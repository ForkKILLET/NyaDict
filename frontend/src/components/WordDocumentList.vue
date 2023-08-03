<script setup lang="ts">
import { ref } from 'vue'
import { useWord } from '@/stores/words'
import WordDocument from '@comp/WordDocument.vue'
import WordDocumentAdder from '@comp/WordDocumentAdder.vue'
import type { IWord, IWordDocumentWithoutId, IWordDocument } from '@type'

const props = defineProps<{
    node: { docs?: IWordDocument[] }
    word: IWord
    actionMode: boolean
}>()

const wordStore = useWord()

const newlyAddedDocId = ref<number | null>(null)

const addDoc = (newDoc: IWordDocumentWithoutId) => {
    newlyAddedDocId.value = wordStore.addDoc(props.node.docs ??= [], newDoc)
}
</script>

<template>
    <div class="doc-list">
        <WordDocumentAdder v-if="actionMode" :word="word" @add-doc="addDoc" />
        <WordDocument
            v-for="doc, index of node.docs ?? []"
            @withdraw="node.docs?.splice(index, 1)"
            :key="doc.id"
            :word="word"
            :doc="doc"
            :edit-mode="newlyAddedDocId === doc.id"
            :action-mode="actionMode"
        />
    </div>
</template>
