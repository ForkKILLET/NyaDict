<script setup lang="ts">
import { computed } from 'vue'

import WordLink from '@comp/WordLink.vue'

import { intersect } from '@/utils'

import type { IWordGraph } from '@type'

const props = defineProps<{
    graph: IWordGraph
}>()

const graph = computed(() => {
    const [ edgesInAndOut, edgesIn, edgesOut ] = intersect(props.graph.edgesIn, props.graph.edgesOut)
    return { edgesInAndOut, edgesIn, edgesOut }
})
</script>


<template>
    <div v-for="id of graph.edgesInAndOut">
        <fa-icon icon="arrows-left-right" /> <WordLink :id="id" />
    </div>
    <div v-for="id of graph.edgesOut">
        <fa-icon icon="arrow-right" /> <WordLink :id="id" />
    </div>
    <div v-for="id of graph.edgesIn">
        <fa-icon icon="arrow-left" /> <WordLink :id="id" />
    </div>
</template>
