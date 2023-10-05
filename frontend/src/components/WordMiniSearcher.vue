<script setup lang="ts">
import { computed, ref } from 'vue'
import { vOnClickOutside } from '@vueuse/components'

import { getHiragana, useWord } from '@store/words'

import { filterN } from '@util'
import { strictToHiragana } from '@util/kana'

import type { IWord } from '@type'

const props = withDefaults(defineProps<{
    maxResult?: number
}>(), {
    maxResult: 4
})

const emit = defineEmits<{
    (event: 'select-word', word: IWord): void
    (event: 'cancel'): void
}>()

const wordStore = useWord()
const search = ref('')

const filteredWords = computed(() => {
    const text = search.value
    if (! text) return []

    const hiragana = strictToHiragana(text)

    return filterN(
        wordStore.words, props.maxResult,
        word => (
            hiragana
                ? getHiragana(word).startsWith(hiragana)
                : word.disp.startsWith(text) || word.sub.startsWith(text)
        )
    )
})

const sortedWords = computed(() => filteredWords.value
    .sort((a, b) => a.disp.length - b.disp.length)
)

const cancel = () => {
    emit('cancel')
    search.value = ''
}

const submit = (word: IWord) => {
    emit('select-word', word)
    search.value = ''
}

const inputEl = ref<HTMLInputElement>()
const focus = () => {
    inputEl.value?.focus()
}

const activeWordIndex = ref(0)
const navigateActiveWord = (delta: number) => {
    const { length } = sortedWords.value
    if (! length) return
    activeWordIndex.value = (activeWordIndex.value + delta + length) % length
}
const submitActiveWord = () => {
    const activeWord = sortedWords.value[activeWordIndex.value]
    if (activeWord) submit(activeWord)
    else cancel()
}

defineExpose({
    focus
})
</script>

<template>
    <div
        v-on-click-outside="cancel"
        class="word-mini-searcher card deep"
    >
        <input
            v-model="search"
            ref="inputEl"
            @keydown.escape.prevent.stop="cancel"
            @keydown.enter.prevent="submitActiveWord"
            @keydown.down="navigateActiveWord(+ 1)"
            @keydown.up="navigateActiveWord(- 1)"
            @change="activeWordIndex = 0"
            class="card light"
        />
        <div class="word-mini-list" v-for="word, index of sortedWords">
            <div
                @click="submit(word)"
                class="word-mini-item"
                :class="{ active: index === activeWordIndex }"
            >{{ word.disp }}</div>
        </div>
    </div>
</template>

<style scoped>
.word-mini-searcher {
    font-size: .8em;
    padding: .5em;
}

input.card.light {
    width: 100%;
    padding: 0 .5em;
}

.word-mini-list:not(:empty) {
    margin-top: .5em;
}

.word-mini-item {
    margin: .2em;
    padding: 0 .3em;
    border-radius: .5em;
    line-height: 1.5;
    color: var(--color-ui);
    transition: .3s background-color;
}

.word-mini-item:hover, .word-mini-item.active {
    background-color: var(--color-ui-bg);
}
</style>
