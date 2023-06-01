<script setup lang="ts">
import { ref } from 'vue'
import { emptyMem } from '../stores/words'
import type { IWord } from '../types/data'

import Card from './Card.vue'

const disp = ref('')
const sub = ref('')

const emit = defineEmits<{
    (event: 'add', word: IWord): void
}>()
</script>

<template>
    <Card class="inline">
        <span class="word-disp"><input v-model="disp" /></span>
        <span class="word-sub"><input v-model="sub" /></span>
        <fa-icon
            @click="emit('add', { disp, sub, mem: emptyMem() })"
            class="button"
            icon="fa-solid fa-circle-plus"
        />
    </Card>
</template>

<style scoped>
.word-disp, .word-sub {
    display: inline-block;
    vertical-align: bottom;
    border-radius: .4em;
    background-color: #ffffff;
    box-shadow: 0 0 .2em #f3aa6d4d inset;
}

input {
    width: 6em;
    color: inherit;
    background-color: transparent;
    font-family: inherit;
}
</style>
