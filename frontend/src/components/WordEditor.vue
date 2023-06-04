<script setup lang="ts">
import { ref, watch } from 'vue'
import type { IWord } from '../types'

import Card from './Card.vue'

const props = defineProps<{
    word?: IWord
}>()

const disp = ref('')
const sub = ref('')

watch(props, () => {
    if (! props.word) return
    disp.value = props.word.disp
    sub.value = props.word.sub
}, { immediate: true })

const emit = defineEmits<{
    (event: 'change', word: Omit<IWord, 'id' | 'mem'>): void
    (event: 'cancel'): void
}>()

const onCancel = () => {
    disp.value = ''
    sub.value = ''
    emit('cancel')
}

const onChange = () => {
    emit('change', {
        disp: disp.value,
        sub: sub.value
    })
}
</script>

<template>
    <Card>
        <span class="word-disp"><input v-model="disp" /></span>
        <span class="word-sub"><input v-model="sub" @keydown.enter="onChange" /></span>
        <fa-icon
            @click="onCancel"
            class="button"
            icon="fa-solid fa-times-circle"
        />
        <fa-icon
            @click="onChange"
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
