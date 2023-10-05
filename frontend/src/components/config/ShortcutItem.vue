<script setup lang="ts">
import { type Shortcut } from '@util/keyboard'

defineProps<{
    shortcut: Shortcut
}>()
</script>

<template>
    <div
        class="shortcut-item"
        :class="{ inactive: shortcut.isActive?.() === false }"
    >
        <span class="shortcut-info">{{ shortcut.info }}</span>

        <kbd class="badge">{{
            (shortcut.key.meta ? 'Meta + ' : '') +
            (shortcut.key.ctrl ? 'Ctrl + ' : '') +
            (shortcut.key.alt ? 'Alt + ' : '') +
            (shortcut.key.shift ? 'Shift + ' : '') +
            shortcut.key.key
        }}</kbd>
    </div>
</template>

<style scoped>
.shortcut-item {
    display: flex;
    justify-content: space-between;
}

.shortcut-item.inactive > .shortcut-info {
    color: #888;
}

kbd {
    font-family: var(--font-mono);
}
</style>
