<script setup lang="ts">
import { computed } from 'vue'

import WordLink from '@comp/WordLink.vue'

import { dedup, intersect } from '@/utils'

import type { IWordGraph, IWordGraphEdge } from '@type'

const props = defineProps<{
    graph: IWordGraph
}>()

const isSameTarget = (a: IWordGraphEdge, b: IWordGraphEdge) => a.targetWord === b.targetWord

const graph = computed(() => {
    const [ edgesInAndOut, edgesIn, edgesOut ] = intersect(
        dedup(props.graph.edgesIn, isSameTarget),
        dedup(props.graph.edgesOut, isSameTarget),
        isSameTarget
    )
    return { edgesInAndOut, edgesIn, edgesOut }
})
</script>


<template>
    <div v-for="edge of graph.edgesInAndOut">
        <fa-icon icon="arrows-left-right" /> <WordLink :id="edge.targetWord" />
    </div>
    <div v-for="edge of graph.edgesOut">
        <fa-icon icon="arrow-right" /> <WordLink :id="edge.targetWord" />
    </div>
    <div v-for="edge of graph.edgesIn">
        <fa-icon icon="arrow-left" /> <WordLink :id="edge.targetWord" />
    </div>
</template>
