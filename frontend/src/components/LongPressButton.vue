<script setup lang="ts">
import { vOnLongPress } from '@vueuse/components'

defineProps<{
    delay: number
    icon: string
    color: string
}>()

const emit = defineEmits<{
    (event: 'long-press'): void
}>()
</script>

<template>
    <div
        v-on-long-press="[ () => emit('long-press'), { delay: delay * 1000 } ]"
        class="long-press-button"
        :style="{ '--delay': delay + 's', '--color': color }"
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
    animation: var(--delay) longpress ease-in, .3s hop var(--delay);
}
</style>
