<script setup lang="ts">
import WordEntry from '@comp/WordEntry.vue'
import NyaList from './NyaList.vue'
import type { IWord } from '@type'

defineProps<{
    words: IWord[]
    activeWordId?: number
}>()

const emit = defineEmits<{
    (event: 'goto-word', word: IWord): void
}>()
</script>

<template>
    <NyaList :items="words" class="word-list">
        <template #header="{ count }">
            <span class="number">{{ count }}</span> 単語
        </template>
        <template #default="{ item: word }">
            <WordEntry
                :key="word.id"
                :word="word"
                :active="activeWordId === word.id"
                @goto-word="(word: IWord) => emit('goto-word', word)"
            />
        </template>
    </NyaList>
</template>
