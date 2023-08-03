<script lang="ts">
export type BarData<T> = Array<{
    period: {
        startPos: number
        endPos: number
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

defineProps<{
    data: BarData<T>
    height: {
        value: number
        unit: string
    }
}>()

const currentIndex = ref<number>()
const currentValue = ref<T | undefined>()
</script>

<template>
    <div class="time-chart" :style="{ height: `${height.value}${height.unit}` }">
        <div
            v-for="{ period, point, value }, index of data"
            @mouseover="currentIndex = index; currentValue = value"
            class="bar"
            :class="{ current: index === currentIndex }"
        >
            <div
                class="time-terminal start"
                :style="{
                    marginTop: `calc(${height.value * period.startPos}${height.unit} - .3em)`,
                    backgroundColor: period.startColor
                }"
            ></div>
            <div
                class="time-terminal end"
                :style="{
                    marginTop: `calc(${height.value * period.endPos}${height.unit} - .3em)`,
                    backgroundColor: period.endColor
                }"
            ></div>
            <div
                class="point"
                :style="{
                    marginTop: `calc(${height.value * point.pos}${height.unit} - .2em)`,
                    backgroundColor: point.color
                }"
            ></div>
            <div class="axis"></div>
        </div>
    </div>
    <slot name="current" :value="currentValue"></slot>
</template>

<style scoped>
.time-chart {
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
    background-color: #000;
    transition: .3s background-color;
}

.bar.current > .axis {
    background-color: #f4a23e;
}
</style>
