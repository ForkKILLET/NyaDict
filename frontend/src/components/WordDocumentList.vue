<script setup lang="ts">
import WordDocumentEntry from '@comp/WordDocumentEntry.vue'
import type { IWord, IWordDocument } from '@type'

defineProps<{
    node: { docs?: IWordDocument[] }
    word: IWord
    hideSelf?: boolean
}>()
</script>

<template>
    <div class="doc-list">
        <WordDocumentEntry
            v-for="doc, index of node.docs ?? []"
            @withdraw="node.docs?.splice(index, 1)"
            :word="word"
            :doc="doc"
            :hide-self="hideSelf"
        />
    </div>
</template>
