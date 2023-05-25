<script setup lang="ts">
import { useWords } from '../../stores/words'
import WordAdder from '../WordAdder.vue'

import WordList from '../WordList.vue'

const wordsStore = useWords()
</script>

<template>
    <WordAdder @add="(word) => wordsStore.add(word)" />
    <WordList :words="wordsStore.words" />
</template>
