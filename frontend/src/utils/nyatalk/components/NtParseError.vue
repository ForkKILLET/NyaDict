<script setup lang="ts">
import type { NtError } from '@util/nyatalk'

defineProps<{
    error?: NtError
}>()
</script>

<template>
    <pre
        v-if="error"
        class="nt-error scroll-x"
    >{{
        error.name + ': ' + error.message
    }}</pre>
</template>

<style scoped>
.nt-error {
    color: var(--color-wrong);
    font-family: var(--font-mono);
    font-size: .8em;
}
</style>
