<script lang="ts">
import dayjs, { Dayjs } from 'dayjs'

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
                date: dayjs(date),
                value: { num }
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

type DataItem = {
    date: Dayjs
    kind: string
    value: T
}

defineProps<{
    startDay: number
    data: DataItem[]
    colors: Record<string, string>
}>()

const current = ref<{
    index: number
    item: DataItem
}>()

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
            <div class="calendar-title no-select" v-for="text of [...'日月火水木金土']">{{ text }}</div>
            <div class="pad" :style="{ width: '1em', height: startDay + 'em' }"></div>
            <template v-for="item, index of data">
                <div
                    class="calendar-day"
                    @mouseover="current = { index, item }"
                    :style="{ background: colors[item.kind] ?? 'var(--color-chart-bg)' }"
                    :class="{
                        current: current?.index === index,
                        'start-of-month': item.date.date() === 1
                    }"
                ></div>
                <div
                    v-if="item.date.date() === 1"
                    class="calendar-month"
                    :style="{ left: (((index + startDay) / 7 | 0) + 1) + 'rem' }"
                >{{ item.date.month() + 1 }} 月</div>
            </template>
        </div>

        <div class="current-message">
            <slot name="current" :item="current?.item"></slot>
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
    top: 0;
    opacity: .3;
    transition: .5s opacity;
}

.calendar > .button:first-of-type {
    left: 0;
    padding-left: 0;
}

.calendar > .button:last-of-type {
    right: 0;
    padding-right: 0;
}

.calendar-inner {
    position: relative;
    display: flex;
    flex-flow: column;
    flex-wrap: wrap;
    align-content: start;
    height: 7em;
    padding-right: 2em;
    padding-top: 1em;
}

.calendar-title {
    position: sticky;
    left: 0;
    font-size: .7em;
    line-height: 1;
    background-color: var(--color-ui-bg);
    z-index: 1;
}

.calendar-month {
    position: absolute;
    top: 0;
    margin: .1em;
    font-size: .7em;
    white-space: nowrap;
}

.calendar-day, .calendar-title {
    width: .8rem;
    height: .8rem;
    margin: .1rem;
}

.calendar-day {
    position: relative;
    border-radius: .2rem;
}

.calendar-day.current {
    outline: 2px solid #db8e3090;
}

.calendar-day.start-of-month::before {
    content: '';
    position: absolute;
    top: -.1em;
    display: block;
    width: 100%;
    height: 1px;
    background: var(--color-ui);
}

.current-message, .current-message * {
    font-size: smaller;
}
</style>
