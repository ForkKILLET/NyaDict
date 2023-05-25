<script setup lang="ts">
import type { IWord } from '../types/data'

import Card from './Card.vue'

defineProps<{
    word: IWord
}>()
</script>

<template>
    <Card>
        <span class="word-disp">{{ word.disp }}</span>
        <span class="word-sub">{{ word.sub }}</span>
    </Card>
</template>
