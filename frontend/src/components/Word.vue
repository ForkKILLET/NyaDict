<script setup lang="ts">
import type { IWord } from '../types/data'

import Card from './Card.vue'

defineProps<{
    word: IWord
}>()
</script>

<template>
    <Card class="word">
        <span class="word-disp">{{ word.disp }}</span>
        <span class="word-sub">{{ word.sub }}</span>
    </Card>
</template>

<style scoped>
.word {
    font-size: 1.3em;
}
</style>