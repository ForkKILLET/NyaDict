<script lang="ts">
import { ref, onActivated, onMounted, type Ref } from 'vue'
import { useEventListener } from '@vueuse/core'

export type IScrollerOptions = {
    direction?: 'horizontal' | 'vertical'
    behavior?: ScrollBehavior
    memory?: boolean
    wheel?: boolean
    buttons?: boolean
    startPos?: number
}

const veryBigNumberForPos = 1e6

export const defaultOptions: IScrollerOptions = {
    direction: 'horizontal',
    behavior: 'smooth',
    memory: true,
    wheel: true,
    buttons: true,
    startPos: veryBigNumberForPos
}

export type IScroller = {
    readonly options: IScrollerOptions
    scrollXBy: (deltaX: number, behavior?: ScrollBehavior) => boolean
    scrollYBy: (deltaY: number, behavior?: ScrollBehavior) => boolean
    scrollBy: (delta: number, behavior?: ScrollBehavior) => boolean
    scrollXTo: (deltaX: number, behavior?: ScrollBehavior) => boolean
    scrollYTo: (deltaY: number, behavior?: ScrollBehavior) => boolean
    scrollTo: (pos: number, behavior?: ScrollBehavior) => boolean
    el?: Ref<HTMLDivElement | undefined>
    memoriedPos?: { x: number; y: number }
}

export const useScroller = (options: IScrollerOptions): IScroller => {
    options = { ...defaultOptions, ...options }
    const whenEl = (fn: (el: HTMLDivElement) => void): boolean => {
        const el = scroller.el?.value
        if (! el) return false
        fn(el)
        return true
    }
    const scroller: IScroller = {
        options,
        scrollXBy: (deltaX, behavior = options.behavior) => whenEl(el => el.scrollBy({ left: deltaX, behavior })),
        scrollYBy: (deltaY, behavior = options.behavior) => whenEl(el => el.scrollBy({ top: deltaY, behavior })),
        scrollBy: (delta, behavior = options.behavior) => {
            if (options.direction === 'horizontal') return scroller.scrollXBy(delta, behavior)
            else return scroller.scrollYBy(delta, behavior)
        },
        scrollXTo: (posX, behavior = options.behavior) => whenEl(el => el.scrollTo({ left: posX, behavior })),
        scrollYTo: (posY, behavior = options.behavior) => whenEl(el => el.scrollTo({ top: posY, behavior })),
        scrollTo: (pos, behavior = options.behavior) => {
            if (options.direction === 'horizontal') return scroller.scrollXTo(pos, behavior)
            else return scroller.scrollYTo(pos, behavior)
        }
    }
    return scroller
}
</script>

<script setup lang="ts">
const props = defineProps<{
    scroller: IScroller
}>()

const root = ref<HTMLDivElement>()

const scroller = props.scroller as IScroller & { el: Ref<HTMLDivElement | undefined> }
scroller.el = root
const { options } = scroller

if (options.memory) {
    useEventListener(root, 'scroll', () => {
        const el = root.value
        if (! el) return
        scroller.memoriedPos = {
            x: el.scrollLeft, y: el.scrollTop
        }
    })
    onActivated(() => {
        const el = root.value
        if (! el) return
        if (scroller.memoriedPos) {
            const { x, y } = scroller.memoriedPos
            el.scrollLeft = x; el.scrollTop = y
        }
    })
}

if (options.wheel) {
    useEventListener(root, 'wheel', (event: WheelEvent) => {
        event.preventDefault()
        const delta = root.value![ options.direction === 'horizontal' ? 'clientWidth' : 'clientHeight' ] / 10

        if (event.deltaY < 0) {
            scroller.scrollBy(- delta)
        }
        else if (event.deltaY > 0) {
            scroller.scrollBy(+ delta)
        }
    })
}

onMounted(() => {
    if (typeof options.startPos === 'number') scroller.scrollTo(options.startPos)
})
</script>

<template>
    <div
        ref="root"
        class="nya-scroller"
        :class="options.direction === 'horizontal' ? 'scroll-x' : 'scroll-y'"
    >
        <slot />
    </div>
    <div
        v-if="options.buttons"
        class="nya-scroller-buttons"
    >
        <fa-icon
            icon="arrow-circle-left"
            class="button nya-scroller-button"
            @click="scroller.scrollBy(- 50)"
        />
        <fa-icon
            icon="arrow-circle-right"
            class="button nya-scroller-button"
            @click="scroller.scrollBy(+ 50)"
        />
    </div>
</template>

<style scoped>
.nya-scroller:hover ~ .nya-scroller-buttons, .nya-scroller-buttons:hover {
    opacity: 1;
}

.nya-scroller-buttons {
    opacity: .3;
    transition: .5s opacity;
    pointer-events: none;
}

.nya-scroller-button {
    position: absolute;
    z-index: 1;
    top: 0;
    padding-top: .1em;
    pointer-events: all;
}

.nya-scroller-button:first-of-type {
    left: 0;
    padding-left: 0;
}

.nya-scroller-button:last-of-type {
    right: 0;
    padding-right: 0;
}
</style>
