<script setup lang="ts">
import type { IWord } from '../types/data'
import Word from './Word.vue'

defineProps<{
    words: IWord[]
}>()
</script>

<template>
    <div class="wordlist">
        <p><span class="number">{{ words.length }}</span> 単語</p>
        <p v-for="word of words">
            <Word :word="word" />
        </p>
    </div>
</template>
