<script setup lang="ts">
import { ref } from 'vue'
import { IWord } from '../types/data'

import Card from './Card.vue'

const disp = ref('')
const sub = ref('')

const emit = defineEmits<{
    (event: 'add', word: IWord): void
}>()
</script>

<template>
    <Card>
        <span class="word-disp"><input v-model="disp" /></span>
        <span class="word-sub"><input v-model="sub" /></span>
        <fa-icon
            @click="emit('add', { disp, sub })"
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

.fa-circle-plus {
    color: #db8e30;
    margin-left: .5em;
    cursor: pointer;
    animation: .3s hop;
}

.fa-circle-plus:active {
    animation: none;
}

input {
    width: 6em;
    color: inherit;
    background-color: transparent;
    font-family: inherit;
}
</style>
