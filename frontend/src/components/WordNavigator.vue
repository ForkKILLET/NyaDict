<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useConfig } from '@store/config' 

import { getEventPoint, type Point } from '@util/dom'
import { mitt } from '@util/mitt'
import { storeReactive } from '@util/storage'
import { newKey, registerShortcuts } from '@util/keyboard'

const { config } = storeToRefs(useConfig())

const root = ref<HTMLDivElement>()
const position = storeReactive('wordNavigatorPosition', {
    left: 0,
    top: 0
})

watch([ position, root ], () => {
    if (! root.value) return
    const maxLeft = window.innerWidth - root.value.clientWidth
    const maxTop = window.innerHeight - root.value.clientHeight
    if (position.left < 0) position.left = 0
    if (position.left > maxLeft) position.left = maxLeft
    if (position.top < 0) position.top = 0
    if (position.top > maxTop) position.top = maxTop
}, { immediate: true })

const lastPoint = ref<Point | null>(null)

const onDragStart = (event: MouseEvent | TouchEvent) => {
    lastPoint.value = getEventPoint(event)
}

const onDragMove = (event: MouseEvent | TouchEvent) => {
    if (! lastPoint.value) return
    const currentPoint = getEventPoint(event)
    position.left += currentPoint.clientX - lastPoint.value.clientX
    position.top += currentPoint.clientY - lastPoint.value.clientY
    lastPoint.value = currentPoint
}

const onDragEnd = () => {
    if (lastPoint.value) lastPoint.value = null
}

useEventListener(root, 'mousedown', onDragStart)
useEventListener(root, 'touchstart', onDragStart)
useEventListener('mousemove', onDragMove)
useEventListener('touchmove', onDragMove)
useEventListener('mouseup', onDragEnd)
useEventListener('touchend', onDragEnd)

const navigate = (action: 'up' | 'down') => mitt.emit('ui:word:navigate', { action })

registerShortcuts([
    {
        id: 'word:navigate:up',
        key: newKey('PageUp'),
        info: '前の単語へ',
        action: () => navigate('up')
    },
    {
        id: 'word:navigate:down',
        key: newKey('PageDown'),
        info: '次の単語へ',
        action: () => navigate('down')
    }
])
</script>

<template>
    <div
        v-if="config.wordNavigator"
        class="word-navigator no-select"
        ref="root"
        :style="{ left: position.left + 'px', top: position.top + 'px' }"
    >
        <fa-icon
            @click="navigate('up')"
            icon="caret-up" class="button"
        />
        <fa-icon
            @click="navigate('down')"
            icon="caret-down" class="button"
        />
    </div>
</template>

<style scoped>
.word-navigator {
    position: fixed;

    display: grid;
    justify-content: center;
    align-content: space-between;

    width: 3.5em;
    height: 3.5em;
    border-radius: 50%;

    background-color: var(--color-ui-bg-alt);
    opacity: .7;
    transition: .3s opacity;
}

.word-navigator:active {
    opacity: 1;
}

svg.button {
    font-size: 1.5em;
}
</style>
