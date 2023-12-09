<script setup lang="ts">
defineProps<{
    prop: string
}>()
</script>

<template>
    <div class="ast-prop">
        <span class="ast-prop-key">[{{ prop }}] </span>
        <slot />
    </div>
</template>
