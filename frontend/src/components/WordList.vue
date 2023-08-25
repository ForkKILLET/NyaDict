<script setup lang="ts">
import WordEntry from '@comp/WordEntry.vue'
import NyaList from '@comp/NyaList.vue'
import type { IWord } from '@type'

defineProps<{
    words: IWord[]
    activeWordId?: number
}>()

const emit = defineEmits<{
    (event: 'goto-word', wordId: number): void
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
                @goto-word="wordId => emit('goto-word', wordId)"
            />
        </template>
    </NyaList>
</template>
