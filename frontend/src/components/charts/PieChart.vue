<script lang="ts">
export type PieData = Array<{
    name: string
    ratio: number
    value: number
    color: string
}>

export const getArc = (perimeter: number) => {
    let start = 0.25
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
import { computed, ref } from 'vue'

const props = defineProps<{
    data: PieData
    actionsEl?: HTMLElement
}>()

const showAll = ref(false)

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
        <svg
            width="8em"
            height="8em"
            viewBox="0 0 20 20"
            class="pie"
        >
            <circle
                v-for="{ attrs, color } of dataWithAttr"
                cx="10"
                cy="10"
                r="10"
                fill="transparent"
                stroke-width="10"
                :stroke="color"
                v-bind="attrs"
            />
        </svg>
        <div
            class="pie-chart-legends"
            :class="{ 'show-all': showAll }"
        >
            <div
                v-for="{ name, value, color, ratio } of data"
                class="pie-chart-legend"
                :class="{ insignificant: ratio < 0.01 }"
            >
                <div
                    class="pie-chart-legend-box"
                    :style="{ backgroundColor: color }"
                />
                <span class="pie-chart-legend-name">{{ name }}</span>
                <span class="pie-chart-legend-value">
                    <span class="number">{{ value }}</span>
                    (<span class="number">{{ (ratio * 100).toFixed(2) + '%' }}</span>)
                </span>
            </div>
        </div>
    </div>
    <Teleport
        :disabled="! actionsEl"
        :to="actionsEl"
    >
        <fa-icon
            v-if="data.some(item => item.ratio < 0.01)"
            :icon="showAll ? 'compress' : 'expand'"
            class="button"
            @click="showAll = ! showAll"
        />
    </Teleport>
</template>

<style scoped>
.pie-chart {
    display: flex;
    flex-flow: wrap;
}
.pie {
    margin-right: 1em;
}
.pie-chart-legend {
    display: flex;
    align-items: baseline;
}
.pie-chart-legend.insignificant {
    max-height: 0;
    opacity: 0;
    transition: .5s max-height, .5s opacity;
}
.pie-chart-legends.show-all .pie-chart-legend.insignificant {
    max-height: 2em;
    opacity: 1;
}
.pie-chart-legend-box {
    width: .8rem;
    height: .8rem;
    margin-right: .3em;
}
.pie-chart-legend-name {
    margin-right: .3em;
}
.pie-chart-legend-value {
    white-space: nowrap;
}
.pie {
    border-radius: 50%;
    flex-shrink: 0;
}
</style>
