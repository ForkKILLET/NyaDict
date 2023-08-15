<script setup lang="ts">
import { toRefs } from 'vue'
import { useWord } from '@store/words'

const wordStore = useWord()

const { testCorrectLevel: level } = toRefs(wordStore.filter)
</script>

<template>
    <fa-icon
        @click="level = (level + 0.5) % 1.5"
        :icon="
            level === 1 ? 'check-circle' :
            level === 0 ? 'times-circle' :
            'question-circle'
        "
        class="button no-hover"
        :class="
            level === 1 ? 'correct' :
            level === 0 ? 'wrong' :
            'half-correct'
        "
    />
</template>
