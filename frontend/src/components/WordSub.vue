<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { isHiragana } from 'wanakana'

import type { IWord } from '@type'

const props = defineProps<{
    word: IWord
}>()

const editMode = ref(false)
const toneInputEl = ref<HTMLInputElement>()

const edit = () => {
    editMode.value = true
    nextTick(() => toneInputEl.value?.focus())
}

const onToneInput = (event: Event) => {
    const inputEl = toneInputEl.value
    if (! inputEl) return

    if (! inputEl.value.match(/^[0-9]$/)) {
        inputEl.value = ''
        event.stopPropagation()
    }
}
const onToneChange = () => {
    const inputEl = toneInputEl.value
    if (! inputEl) return

    const tone = Number(inputEl.value)
    props.word.tone = isNaN(tone) ? undefined : tone
    editMode.value = false
}
</script>

<template>
    <span
        class="word-sub word-hiragana"
        v-if="isHiragana(word.sub)"
    >
        <span
            v-for="char, index of [ ...word.sub ]"
            class="word-sub-char"
            :class="word.tone !== undefined && {
                flat: index && (word.tone === 0 || index < word.tone - 1),
                descend: index === word.tone - 1
            }"
        >{{ char }}</span>

        <span
            v-if="! editMode"
            class="word-tone"
            @click="edit"
        >{{ word.tone ?? '-' }}</span>
        <input
            v-else
            ref="toneInputEl"
            class="word-tone-editor"
            @input="onToneInput"
            @change="onToneChange"
            @blur="onToneChange"
        />
    </span>
    <span class="word-sub" v-else>{{ word.sub }}</span>
</template>

<style scoped>
.word-tone, .word-tone-editor {
    width: 1em;
    height: 1em;
    padding: .1em;
    margin-left: 1em;
    font-size: .8em;

    text-align: center;
    border-radius: 50%;
}

.word-tone {
    display: inline-flex;
    justify-content: center;
    align-items: center;

    border: 1px solid var(--color-num);
    color: var(--color-num);
    user-select: none;
}

.word-tone-editor {
    border: 1px solid var(--color-ui);
    color: var(--color-ui);
    background-color: unset;
}

.word-sub-char {
    position: relative;
}

.descend::before, .flat::before {
    content: '';
    display: block;
    position: absolute;

    top: .2em;
    left: 0;
    width: 1em;
    height: 1px;
    background: var(--color-num);
}
.descend::after {
    content: '';
    display: block;
    position: absolute;
    top: .2em;
    right: 0;

    width: 1px;
    height: .5em;
    background: var(--color-num);
}
</style>
