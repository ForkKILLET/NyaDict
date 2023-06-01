<script setup lang="ts">
import type { IWord } from '../types/data'

import Word from './Word.vue'

defineProps<{
    words: IWord[]
}>()

const emit = defineEmits<{
    (event: 'goto-word', word: IWord): void
}>()
</script>

<template>
    <div class="word-list">
        <p><span class="number">{{ words.length }}</span> 単語</p>
        <p v-for="word of words">
            <Word :word="word">
                <fa-icon
                    class="button"
                    icon="fa-solid fa-arrow-circle-right"
                    @click="emit('goto-word', word)"
                />
            </Word>
        </p>
    </div>
</template>
