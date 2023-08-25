<script setup lang="ts">
import { computed } from 'vue'

import { isSameTargetEdge } from '@store/words'
import { dedup, intersect } from '@util'

import WordLink from '@comp/WordLink.vue'

import type { IWordGraph } from '@type'

const props = defineProps<{
    graph: IWordGraph
}>()


const graph = computed(() => {
    const [ edgesInAndOut, edgesIn, edgesOut ] = intersect(
        dedup(props.graph.edgesIn, isSameTargetEdge),
        dedup(props.graph.edgesOut, isSameTargetEdge),
        isSameTargetEdge
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
