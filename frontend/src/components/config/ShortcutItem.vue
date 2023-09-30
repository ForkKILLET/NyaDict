<script setup lang="ts">
import { type Shortcut } from '@util/keyboard'

defineProps<{
    shortcut: Shortcut
}>()
</script>

<template>
    <div class="shortcut-item">
        <span>{{ shortcut.info }}</span>

        <kbd class="badge">{{
            (shortcut.key.meta ? 'Meta + ' : '') +
            (shortcut.key.ctrl ? 'Ctrl + ' : '') +
            (shortcut.key.alt ? 'Alt + ' : '') +
            (shortcut.key.shift ? 'Shift + ' : '') +
            shortcut.key.key.toUpperCase()
        }}</kbd>
    </div>
</template>

<style scoped>
.shortcut-item {
    display: flex;
    justify-content: space-between;
}

kbd {
    font-family: 'Fira Code', 'Consolas', monospace;
}
</style>
