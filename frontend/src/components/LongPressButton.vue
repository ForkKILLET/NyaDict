<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
    duration: number
    icon: string
    color: string
}>()

const emit = defineEmits<{
    (event: 'long-press'): void
}>()

const startTime = ref<number | null>(null)
const onMouseUp = () => {
    if (! startTime.value) return
    const duration = Date.now() - startTime.value
    if (duration >= props.duration * 1000) {
        startTime.value = null
        emit('long-press')
    }
}
</script>

<template>
    <div
        @mousedown="startTime = Date.now()"
        @mouseup="onMouseUp"
        class="long-press-button"
        :style="{ '--duration': duration + 's', '--color': color }"
    >
        <fa-icon :icon="icon" />
    </div>
</template>

<style scoped>
@keyframes longpress {
    100% {
        color: #fff;
        background-color: var(--color);
    }
}

.long-press-button {
    display: inline-block;
    padding: .5em;
    width: 1rem;
    height: 1rem;
    line-height: 1;
    color: var(--color);
    background-color: #f2f2f280;
    border-radius: 1rem;
    cursor: pointer;
}

.long-press-button > svg {
    width: 1em;
    height: 1em;
}

.long-press-button:active {
    animation: var(--duration) longpress ease-in, .3s hop var(--duration);
}
</style>
