<script setup lang="ts">
import { ref, watch } from 'vue'
import { isHiragana } from 'wanakana'
import type { IWord } from '@type'

const props = defineProps<{
    word?: IWord
}>()

const disp = ref('')
const sub = ref('')
const composition = ref('')

watch(props, () => {
    if (! props.word) return
    disp.value = props.word.disp
    sub.value = props.word.sub
}, { immediate: true })

const emit = defineEmits<{
    (event: 'change', word: Omit<IWord, 'id' | 'mem'>): void
    (event: 'cancel'): void
}>()

const clearInput = () => {
    disp.value = ''
    sub.value = ''
}

const onCancel = () => {
    clearInput()
    emit('cancel')
}

const onChange = () => {
    emit('change', {
        disp: disp.value,
        sub: sub.value
    })
    clearInput()
}

const onCompositionUpdate = (event: CompositionEvent) => {
    if (isHiragana(event.data)) composition.value = event.data
}

const onCompositionEnd = (event: CompositionEvent) => {
    if (event.data === disp.value && composition.value) sub.value = composition.value
    composition.value = ''
}
</script>

<template>
    <div class="card">
        <span class="word-disp">
            <input
                v-model="disp"
                @compositionupdate="onCompositionUpdate"
                @compositionend="onCompositionEnd"
            />
        </span>
        <span class="word-sub">
            <input v-model="sub" @keydown.enter="onChange" />
        </span>
        <fa-icon
            @click="onCancel"
            class="button"
            icon="times-circle"
        />
        <fa-icon
            @click="onChange"
            class="button"
            icon="circle-check"
        />
    </div>
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
