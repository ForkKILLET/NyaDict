<script setup lang="ts">
import WordLink from '@comp/WordLink.vue';

import { intersect } from '@/utils'

import type { IWordGraph } from '@type'

const props = defineProps<{
    graph: IWordGraph
}>()

const [ edgesInAndOut, edgesIn, edgesOut ] = intersect(props.graph.edgesIn, props.graph.edgesOut)
</script>


<template>
    <div v-for="id of edgesInAndOut">
        <fa-icon icon="arrows-left-right" /> <WordLink :id="id" />
    </div>
    <div v-for="id of edgesOut">
        <fa-icon icon="arrow-right" /> <WordLink :id="id" />
    </div>
    <div v-for="id of edgesIn">
        <fa-icon icon="arrow-left" /> <WordLink :id="id" />
    </div>
</template>
