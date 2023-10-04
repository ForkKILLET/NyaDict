<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    modelValue: number
}>()

const emit = defineEmits<{
    (event: 'update:modelValue', value: number): void
}>()

const level = computed({
    get: () => props.modelValue,
    set: (newLevel) => emit('update:modelValue', newLevel)
})
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
