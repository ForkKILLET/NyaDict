<script setup lang="ts">
import type { IWord } from '@type'

import Word from '@comp/Word.vue'

defineProps<{
    word: IWord
    active: boolean
}>()

const emit = defineEmits<{
    (event: 'goto-word', wordId: number): void
}>()
</script>

<template>
    <div class="word-entry">
        <Word
            :word="word"
            :class="{ barber: active }"
        >
            <fa-icon
                icon="arrow-circle-right"
                class="button"
                @click="emit('goto-word', word.id)"
            />
        </Word>
    </div>
</template>
