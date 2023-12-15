<script lang="ts">
export type BarData<T> = Array<{
    period: {
        startPos: number
        endPos: number | null
        startColor: string
        endColor: string
    }
    point: {
        pos: number
        color: string
    }
    value?: T
}>;
</script>

<script setup lang="ts" generic="T">
import { ref } from 'vue'

import NyaScroller, { useScroller } from '@comp/NyaScroller.vue'

defineProps<{
    data: BarData<T>
    height: {
        value: number
        unit: string
    }
}>()

const currentIndex = ref<number>()
const currentValue = ref<T | undefined>()

const scroller = useScroller({
    direction: 'horizontal',
    memory: true,
    wheel: true,
    behavior: 'smooth'
})
</script>

<template>
    <div class="time-chart">
        <NyaScroller :scroller="scroller">
            <div
                class="time-chart-inner"
                :style="{
                    width: `${data.length * 1.4}em`,
                    height: `${height.value}${height.unit}`
                }"
            >
                <div
                    v-for="{ period, point, value }, index of data"
                    class="bar"
                    :class="{ current: index === currentIndex }"
                    @mouseover="currentIndex = index; currentValue = value"
                >
                    <div
                        class="time-terminal start"
                        :style="{
                            marginTop: `calc(${height.value * period.startPos}${height.unit} - .3em)`,
                            backgroundColor: period.startColor
                        }"
                    />
                    <div
                        v-if="period.endPos"
                        class="time-terminal end"
                        :style="{
                            marginTop: `calc(${height.value * period.endPos}${height.unit} - .3em)`,
                            backgroundColor: period.endColor
                        }"
                    />
                    <div
                        class="point force-radius"
                        :style="{
                            marginTop: `calc(${height.value * point.pos}${height.unit} - .2em)`,
                            backgroundColor: point.color
                        }"
                    />
                    <div class="axis" />
                </div>
            </div>
        </NyaScroller>
        <slot
            name="current"
            :value="currentValue"
        />
    </div>
</template>

<style scoped>
.time-chart {
    position: relative;
}

.time-chart-inner {
    display: flex;
    margin: 1em .5em;
    padding: .5em;
}

.bar {
    position: relative;
    width: 1em;
    margin: 0 .2em;
    z-index: 1;
}

.time-terminal {
    position: absolute;
    width: 1em;
    height: .6em;
    opacity: .8;
    z-index: 1;
}

.point {
    position: absolute;
    top: 0;
    left: 0;

    width: .5em;
    height: .5em;
    margin-left: .25em;
    border-radius: 50%;
    z-index: 1;
}

.axis {
    position: absolute;
    left: .45em;
    top: -.5em;
    width: .1em;
    height: 100%;
    padding: 1em 0;
    background-color: var(--color-fg);
    transition: .3s background-color;
}

.bar.current > .axis {
    background-color: var(--color-ui-act);
}
</style>
