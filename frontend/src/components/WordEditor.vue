<script setup lang="ts">
import { ref } from 'vue'
import { emptyMem } from '../stores/words'
import type { IWord } from '../types/data'

import Card from './Card.vue'

const props = defineProps<{
    word?: IWord
}>()

const disp = ref(props.word?.disp ?? '')
const sub = ref(props.word?.sub ?? '')

const emit = defineEmits<{
    (event: 'change', word: Omit<IWord, 'id'>): void
}>()
</script>

<template>
    <Card>
        <span class="word-disp"><input v-model="disp" /></span>
        <span class="word-sub"><input v-model="sub" /></span>
        <fa-icon
            @click="emit('change', { disp, sub, mem: emptyMem() })"
            class="button"
            icon="fa-solid fa-circle-check"
        />
    </Card>
</template>

<style scoped>
.card {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.word-disp, .word-sub {
    display: inline-block;
    border-radius: .4em;
    background-color: #ffffff;
    box-shadow: 0 0 .2em #f3aa6d4d inset;
}

input {
    width: 100%;
    color: inherit;
    background-color: transparent;
    font-family: inherit;
}
</style>
