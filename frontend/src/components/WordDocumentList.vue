<script setup lang="ts">
import { computed } from 'vue'

import WordDocumentEntry from '@comp/WordDocumentEntry.vue'

import type { IWord, IWordDocument } from '@type'

const props = defineProps<{
    node: { docs?: IWordDocument[] }
    word: IWord
    hideSelf?: boolean
}>()

const sortedDocs = computed(() => {
    const docs = [ ...props.node.docs ?? [] ]
    return docs.sort((a, b) => a.kind - b.kind)
})

const withdrawDoc = (docId: number) => {
    const docs = props.node.docs
    if (! docs) return

    const index = docs.findIndex(doc => doc.id === docId)
    if (index >= 0) docs.splice(index, 1)
}
</script>

<template>
    <div class="doc-list">
        <WordDocumentEntry
            v-for="doc of sortedDocs"
            :key="doc.id"
            :word="word"
            :doc="doc"
            :hide-self="hideSelf"
            @withdraw="withdrawDoc(doc.id)"
        />
    </div>
</template>
