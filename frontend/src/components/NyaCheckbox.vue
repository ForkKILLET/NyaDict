<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    modelValue?: boolean
}>()

const emits = defineEmits<{
    (event: 'update:modelValue', value: boolean): void
}>()

const value = computed({
    get: () => props.modelValue,
    set: v => emits('update:modelValue', v)
})
</script>

<template>
    <label class="checkbox-label">
        <input type="checkbox" v-model="value" />
        <div class="inline card checkbox"><slot></slot></div>
    </label>
</template>
