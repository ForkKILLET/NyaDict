<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    r: number
    x1?: number
    y1?: number
    x2?: number
    y2?: number
    twoWay: boolean
}>()

const a = computed(() => {
    const { r, x1, y1, x2, y2 } = props
    if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) return

    const R = Math.hypot(x1 - x2, y1 - y2)
    const tScale = r / R
    const aScale = 6 / R

    const tx1 = x1 + (x2 - x1) * tScale
    const ty1 = y1 + (y2 - y1) * tScale
    const tx2 = x2 + (x1 - x2) * tScale
    const ty2 = y2 + (y1 - y2) * tScale

    const ax1 = tx1 + (x2 - x1) * aScale
    const ay1 = ty1 + (y2 - y1) * aScale
    const ax2 = tx2 + (x1 - x2) * aScale
    const ay2 = ty2 + (y1 - y2) * aScale

    const adx = (y2 - y1) * 3 / R
    const ady = (x2 - x1) * 3 / R

    return { tx1, ty1, tx2, ty2, ax1, ay1, ax2, ay2, adx, ady }
})
</script>

<template>
    <g
        v-if="a"
        class="arrow"
        :class="{ major: twoWay }"
    >
        <line
            :x1="a.tx1"
            :y1="a.ty1"
            :x2="a.tx2"
            :y2="a.ty2"
        />
        <path
            :d="`M ${a.tx2} ${a.ty2} L ${a.ax2 + a.adx} ${a.ay2 - a.ady} L ${a.ax2 - a.adx} ${a.ay2 + a.ady} Z`"
        />
        <path
            v-if="twoWay"
            :d="`M ${a.tx1} ${a.ty1} L ${a.ax1 + a.adx} ${a.ay1 - a.ady} L ${a.ax1 - a.adx} ${a.ay1 + a.ady} Z`"
        />
    </g>
</template>

<style scoped>
.arrow:not(.major) line {
    stroke-dasharray: 5;
}

.arrow path {
    fill: var(--color-fg);
    stroke-width: 2;
    stroke: var(--color-fg);
}

</style>
