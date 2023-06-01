<script setup lang="ts">
import type { IMemory } from '../types/data'

defineProps<{
    mem: IMemory
}>()
</script>

<template>
    <span class="mem-stat number correct">
        {{ mem.correctNum }}
        <fa-icon icon="fa-solid fa-check-circle" />
    </span>
    <span class="mem-stat number wrong">
        {{ mem.wrongNum }}
        <fa-icon icon="fa-solid fa-times-circle" />
    </span>
</template>

<style scoped>
.mem-stat {
    padding: 0 .5em;
}
.mem-stat > svg {
    margin-left: .2em;
}

.correct {
    color: #95e35d;
}

.wrong {
    color: #ec4e1e;
}
</style>
