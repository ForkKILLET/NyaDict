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
        <p><span class="number">{{ words.length }}</span> 単語</p>
        <p v-for="word of words">
            <WordListEntry
                :word="word"
                :active="activeWordId === word.id"
                :class="{
                    active: activeWordId === word.id
                }"
                @goto-word="word => emit('goto-word', word)"
            />
        </p>
    </div>
</template>

<style scoped>
@keyframes barber {
    from {
        background-position-x: 0;
    }
    to {
        background-position-x: 25px;
    }
}
.word-list-entry.active:deep(> .card) {
    background-image: linear-gradient(
        -45deg,
        #fff 0, #fff 25%, #fffaf6 25%, #fffaf6 50%,
        #fff 50%, #fff 75%, #fffaf6 75%, #fffaf6 100%
    );
    background-size: 25px 25px;

    animation: barber .5s linear infinite;
}
</style>
