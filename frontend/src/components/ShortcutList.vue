<script setup lang="ts">
import { shortcuts } from '@util/keyboard'

import ShortcutItem from '@comp/config/ShortcutItem.vue'
</script>

<template>
    <div class="shortcut-list">
        <span class="shortcut-title">ショートカット</span>
        <ShortcutItem
            v-for="shortcut of shortcuts"
            :key="shortcut.id"
            :shortcut="shortcut"
        />
    </div>
</template>

<style scoped>
.shortcut-list.modal-slot {
    max-height: 90vh;
	overflow-y: auto;
    scrollbar-width: none;
}

.shortcut-list.modal-slot::-webkit-scrollbar {
    display: none;
}

.shortcut-item {
    font-size: .8em;
    margin-top: .5em;
}

.shortcut-title {
    font-weight: bold;
    font-size: 1.1em;
    color: var(--color-ui);
}
</style>
