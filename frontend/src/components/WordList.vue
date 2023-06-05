<script setup lang="ts">
import type { IWord } from '../types'

import WordListEntry from './WordListEntry.vue'

defineProps<{
    words: IWord[]
    activeWordId?: number
}>()

const emit = defineEmits<{
    (event: 'goto-word', word: IWord): void
}>()
</script>

<template>
    <div class="word-list">
        <p class="word-count"><span class="number">{{ words.length }}</span> 単語</p>
        <p v-for="word of words">
            <WordListEntry
                :key="word.id"
                :word="word"
                :active="activeWordId === word.id"
                @goto-word="word => emit('goto-word', word)"
            />
        </p>
    </div>
</template>

<style scoped>
.word-count {
    margin-top: 0;
}
</style>
