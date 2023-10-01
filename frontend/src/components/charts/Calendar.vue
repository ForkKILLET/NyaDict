<script lang="ts">
import dayjs from 'dayjs'

import { gradeBy } from '@util'

export const getCalendarData = <T>(source: T[], getDate: (item: T) => number) => {
    const today = dayjs()

    const dates = []
    const nums: Record<string, number> = {}
    let firstDate = Infinity
    let maxNum = 0

    source.forEach(item => {
        const date = + dayjs(getDate(item)).startOf('d')
        if (date < firstDate) firstDate = date
        nums[date] ??= 0
        if (++ nums[date] > maxNum) maxNum = nums[date]
    })

    if (firstDate !== Infinity) for (
        let day = dayjs(firstDate);
        ! day.isAfter(today, 'd');
        day = day.add(1, 'd')
    ) {
        const date = + day.startOf('d')
        dates.push(date)
    }

    const data = dates
        .map(date => {
            const num = nums[date]
            return {
                kind: gradeBy(num, maxNum),
                value: {
                    num,
                    date
                }
            }
        })
    return {
        firstDate: dayjs(firstDate),
        data
    }
}
</script>

<script setup lang="ts" generic="T">
import { onMounted, ref } from 'vue'

defineProps<{
    startDay: number
    data: Array<{
        kind: string
        value?: T
    }>
    colors: Record<string, string>
}>()

const currentIndex = ref<number>()
const currentValue = ref<T | undefined>()

const inner = ref<HTMLDivElement>()

const scrollInner = (deltaX: number) => {
    inner.value?.scrollBy({
        left: deltaX,
        behavior: 'smooth'
    })
}

onMounted(() => scrollInner(inner.value?.clientWidth ?? 0))
</script>

<template>
    <div class="calendar">
        <fa-icon @click="scrollInner(- 50)" icon="arrow-circle-left" class="button"></fa-icon>
        <fa-icon @click="scrollInner(+ 50)" icon="arrow-circle-right" class="button"></fa-icon>

        <div class="calendar-inner scroll-x" ref="inner">
            <div class="calendar-title" v-for="text of [...'日月火水木金土']">{{ text }}</div>
            <div class="pad" :style="{ width: '1em', height: startDay + 'em' }"></div>
            <div
                v-for="{ kind, value }, index of data"
                class="calendar-day"
                @mouseover="currentIndex = index; currentValue = value"
                :style="{ background: colors[kind] ?? 'var(--color-chart-bg)' }"
                :class="{ current: index === currentIndex }"
            ></div>
        </div>

        <div class="current-message">
            <slot name="current" :value="currentValue"></slot>
        </div>
    </div>
</template>

<style scoped>
.calendar {
    position: relative;
}

.calendar:hover > .button {
    opacity: 1;
}

.calendar > .button {
    position: absolute;
    z-index: 1;
    top: 3em;
    opacity: .3;
    transition: .5s opacity;
}

.calendar > .button:first-of-type {
    left: 1em;
}

.calendar > .button:last-of-type {
    right: 0;
}

.calendar-inner {
    position: relative;
    display: flex;
    flex-flow: column;
    flex-wrap: wrap;
    align-content: start;
    height: 7em;
}

.calendar-title {
    position: sticky;
    left: 0;
    font-size: .7em;
    line-height: 1;
    background-color: var(--color-ui-bg);
}

.calendar-day, .calendar-title {
    width: .8rem;
    height: .8rem;
    margin: .1rem;
}

.calendar-day {
    border-radius: .2rem;
}

.calendar-day.current {
    outline: 2px solid #db8e3090;
}

.current-message, .current-message * {
    font-size: smaller;
}
</style>
