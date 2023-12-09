<script setup lang="ts">
import { ref } from 'vue'
import { addNoti, removeNoti } from '@util/notif'

const props = defineProps<{
    delay: number
    icon: string
    color: string
    desc: string
}>()

const emit = defineEmits<{
    (event: 'long-press'): void
}>()

const nid = ref()
const charged = ref(false)

const onLongPressStart = () => {
    nid.value = addNoti({
        content: props.desc,
        type: 'charge',
        icon: props.icon,
        duration: props.delay * 1000,

        onCharge: () => {
            charged.value = true
        }
    })
}
const onLongPressEnd = () => {
    if (charged.value) {
        charged.value = false
        emit('long-press')
    }

    if (nid.value !== undefined) {
        removeNoti(nid.value)
        nid.value = undefined
    }
}
</script>

<template>
    <div
        class="long-press-button"
        :style="{ '--duration': delay + 's', '--color': color }"
        @mousedown="onLongPressStart"
        @touchstart="onLongPressStart"
        @mouseup="onLongPressEnd"
        @touchend="onLongPressEnd"
    >
        <fa-icon :icon="icon" />
    </div>
</template>

<style scoped>
@keyframes longpress {
    to {
        color: var(--color-bg);
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
    background-color: var(--color-transparent);
    border-radius: 1rem;
    cursor: pointer;
}

.long-press-button > svg {
    width: 1em;
    height: 1em;
    vertical-align: baseline;
}

.long-press-button:active {
    animation: var(--duration) longpress ease-in, .3s hop var(--duration);
}
</style>
