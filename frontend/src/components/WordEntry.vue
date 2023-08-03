<script setup lang="ts">
import type { IWord } from '@type'

import Word from '@comp/Word.vue'

defineProps<{
    word: IWord
    active: boolean
}>()

const emit = defineEmits<{
    (event: 'goto-word', word: IWord): void
}>()
</script>

<template>
    <div class="word-entry">
        <Word :word="word" :class="{ barber: active }">
            <fa-icon
                @click="emit('goto-word', word)"
                icon="arrow-circle-right" class="button"
            />
        </Word>
    </div>
</template>
