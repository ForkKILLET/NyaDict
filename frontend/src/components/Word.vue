<script setup lang="ts">
import type { IWord } from '../types/data'

import Card from './Card.vue'
import WordMemBrief from './WordMemBrief.vue'

defineProps<{
    word: IWord
}>()
</script>

<template>
    <Card class="word">
        <div>
            <span class="word-disp">{{ word.disp }}</span>
            <span class="word-sub">{{ word.sub }}</span>
        </div>
        <div class="word-info">
            <WordMemBrief :mem="word.mem" />
            <slot></slot>
        </div>
    </Card>
</template>

<style scoped>
.word {
    display: flex;
    justify-content: space-between;
}

.word-info {
    white-space: nowrap;
}
</style>
