<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    modelValue?: boolean
    tiny?: boolean
}>()

const emit = defineEmits<{
    (event: 'update:modelValue', value: boolean): void
}>()

const value = computed({
    get: () => props.modelValue,
    set: v => emit('update:modelValue', v)
})
</script>

<template>
    <label class="checkbox-label">
        <input type="checkbox" v-model="value" />
        <div
            class="checkbox"
            :class="tiny ? 'badge' : 'inline card'"
        >
            <slot></slot>
        </div>
    </label>
</template>

<style scoped>
.badge {
    margin: 0;
}
</style>
