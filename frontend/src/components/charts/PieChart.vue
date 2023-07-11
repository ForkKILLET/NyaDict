<script lang="ts">
export type PieData = Array<{
    name: string
    ratio: number
    value: number
    color: string
}>

export const getArc = (perimeter: number) => {
    let start = .25
    return (ratio: number) => {
        const attrs = {
            'stroke-dasharray': String(perimeter * ratio) + ' ' + String(perimeter * (1 - ratio)),
            'stroke-dashoffset': String(perimeter * start)
        }
        start -= ratio
        return attrs
    }
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    data: PieData
}>()

const dataWithAttr = computed<
    Array<PieData[number] & { attrs: ReturnType<ReturnType<typeof getArc>> }>
>(() => {
    const arc = getArc(2 * Math.PI * 10)
    return props.data.map(data => ({
        ...data,
        attrs: arc(data.ratio)
    }))
})
</script>

<template>
    <div class="pie-chart">
        <svg width="8em" height="8em" viewBox="0 0 20 20" class="pie">
            <circle
                v-for="{ attrs, color } of dataWithAttr"
                cx="10" cy="10" r="10"
                stroke-width="10"
                :stroke="color"
                fill="transparent"
                v-bind="attrs"
            ></circle>
        </svg>
        <div class="pie-chart-legend-area">
            <div v-for="{ name, value, color } of data" class="pie-chart-legend">
                <div class="pie-chart-legend-box" :style="{ backgroundColor: color }"></div>
                <span class="pie-chart-legend-name">{{ name }}</span>
                <span class="pie-chart-legend-value number">{{ value }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pie-chart {
    display: flex;
}
.pie-chart-legend-area {
    margin-left: 1em;
}
.pie-chart-legend {
    display: flex;
    align-items: baseline;
}
.pie-chart-legend-box {
    width: .8rem;
    height: .8rem;
    margin-right: .3em;
}
.pie-chart-legend-name {
    margin-right: .3em;
}
.pie {
    border-radius: 50%;
    flex-shrink: 0;
}
</style>
