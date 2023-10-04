<script setup lang="ts">
// defineProps<{
    
// }>()

const emit = defineEmits<{
    (event: 'delete'): void
}>()
</script>

<template>
    <span class="word-filter-unit badge">
        <slot></slot>
        <fa-icon
            @click="emit('delete')"
            icon="trash" class="button"
        />
    </span>
</template>
