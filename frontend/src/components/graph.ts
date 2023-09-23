import { wordGraphStore, props } from './WordGraphChart.vue';

export const graph = depRef(
() => wordGraphStore.useGraph(props.word),
() => props.word
);
