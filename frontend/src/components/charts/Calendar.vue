<script lang="ts">
import dayjs, { Dayjs } from 'dayjs'
import { useEventListener } from '@vueuse/core'

import { gradeBy } from '@util'
import { getEventPoint } from '@util/dom'

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
            const count = nums[date] ?? 0
            return {
                kind: gradeBy(count, maxNum),
                date: dayjs(date),
                count,
                value: undefined
            }
        })
    return {
        firstDate: dayjs(firstDate),
        data
    }
}
</script>

<script setup lang="ts" generic="T">
import { computed, onMounted, ref } from 'vue'

type DataItem = {
    date: Dayjs
    kind: string
    value: T
    count?: number
}

type LineDataItem = DataItem & {
    total?: number
    ratio?: number
}

type MoveEvent = MouseEvent | TouchEvent

const props = defineProps<{
    startDay: number
    data: DataItem[]
    colors: Record<string, string>
    hasCount: boolean
    actionsEl?: HTMLElement
}>()

const current = ref<{
    index: number
    item: LineDataItem
}>()
const currentFixed = ref(false)
const setCurrent = (index: number) => {
    const item = (props.hasCount ? lineData.value! : props.data)[index]
    if (item) current.value = { index, item }
}
const switchCurrentFixing = () => {
    if (! currentFixed.value) currentFixed.value = true
    else {
        currentFixed.value = false
        if (lineMode.value) onLineMove()
        else onCalendarMove()
    }
}

const linePathXSpacing = ref(2)
const linePathHeight = 100
const lineMode = ref(false)
const lineSvg = ref<SVGElement>()
const lineData = computed(() => {
    if (! props.hasCount) return

    let total = 0
    return props.data
        .map<DataItem & { total: number }>(item => ({
            ...item,
            total: total += item.count! // This exclamation mark is endorsed by `hasCount`.
        }))
        .map<DataItem & { total: number, ratio: number }>(item => ({
            ...item,
            ratio: item.total / total
        }))
})
const linePath = computed(() => {
    if (! lineData.value) return
    const data = lineData.value

    const points = data.map((item, index) => {
        const x = index * linePathXSpacing.value
        const y = (1 - item.ratio) * linePathHeight
        return `${x},${y.toFixed(2)}`
    })

    const path = `M ${points[0]} L ${points.join(' ')}`
    return path
})

const lastLineMoveEvent = ref<MoveEvent>()
const lastCalendarMoveEvent = ref<MoveEvent>()

const onLineMove = (event?: MoveEvent | undefined) => {
    if (event) lastLineMoveEvent.value = event
    else event = lastLineMoveEvent.value
    if (! event) return

    if (currentFixed.value) return
    if (! lineMode.value || ! lineSvg.value || ! lineData.value) return

    const { clientX } = getEventPoint(event)
    const index = (clientX - lineSvg.value.getBoundingClientRect().x)
        / lineSvg.value.clientWidth * lineData.value.length | 0
    setCurrent(index)
}

const onCalendarMove = (event?: MoveEvent | undefined) => {
    if (event) lastCalendarMoveEvent.value = event
    else event = lastCalendarMoveEvent.value
    if (! event) return

    if (currentFixed.value) return
    if (lineMode.value) return

    const { target } = event
    if (target instanceof HTMLDivElement && target.classList.contains('calendar-day')) {
        const index = Number(target.dataset.index)
        setCurrent(index)
    }
    else current.value = undefined
}

const onWheel = (event: WheelEvent) => {
    event.preventDefault()
    if (event.deltaY < 0) {
        scrollInner(- 10, 'instant')
    }
    else if (event.deltaY > 0) {
        scrollInner(+ 10, 'instant')
    }
}

const inner = ref<HTMLDivElement>()

const scrollInner = (deltaX: number, behavior: ScrollBehavior = 'smooth') => {
    inner.value?.scrollBy({
        left: deltaX,
        behavior
    })
}

onMounted(() => scrollInner(inner.value?.clientWidth ?? 0))

useEventListener(lineSvg, [ 'mousemove', 'touchmove' ], onLineMove)
useEventListener(inner, [ 'mousemove', 'touchmove' ], onCalendarMove)
useEventListener(inner, 'wheel', onWheel)
</script>

<template>
    <div class="calendar">
        <fa-icon @click="scrollInner(- 50)" icon="arrow-circle-left" class="button"></fa-icon>
        <fa-icon @click="scrollInner(+ 50)" icon="arrow-circle-right" class="button"></fa-icon>

        <div
            @click="switchCurrentFixing"
            ref="inner"
            class="calendar-inner scroll-x"
            :class="{ 'current-fixed': currentFixed }"
        >
            <template
                v-if="! lineMode"
                ref="calendarChart"
                class="calendar-chart"
            >
                <div class="calendar-title no-select" v-for="text of [...'日月火水木金土']">{{ text }}</div>
                <div class="pad" :style="{ width: '1em', height: startDay + 'em' }"></div>
                <template v-for="item, index of hasCount ? lineData : data">
                    <div
                        class="calendar-day"
                        :data-index="index"
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
            </template>

            <template v-else-if="hasCount && lineData">
                <svg
                    ref="lineSvg"
                    class="line-chart"
                    height="10em"
                    :viewBox="`0 ${- linePathHeight * 0.1} ${lineData.length * linePathXSpacing} ${linePathHeight * 1.2}`"
                >
                    <path
                        :d="linePath"
                        fill="none"
                        stroke="var(--color-ui)"
                        stroke-width="2"
                    ></path>
                    <template v-if="current">
                        <circle
                            :cx="current.index * linePathXSpacing"
                            :cy="(1 - current.item.ratio!) * linePathHeight"
                            r="4"
                            fill="var(--color-fg)"
                        ></circle>
                    </template>
                </svg>
            </template>
        </div>

        <div class="current-message">
            <slot name="current" :item="current?.item"></slot>
        </div>
    </div>
    <Teleport :disabled="! actionsEl" :to="actionsEl">
        <fa-icon
            @click="lineMode = ! lineMode"
            :icon="lineMode ? 'calendar' : 'chart-line'"
            class="button"
        />
    </Teleport>
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
    padding-top: .1em;
}

.calendar > .button:first-of-type {
    left: 0;
    padding-left: 0;
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
    padding-right: 3em;
    padding-top: 1.5em;
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

.calendar-day {
    position: relative;
    width: .8rem;
    height: .8rem;
    margin: .1rem;
    border-radius: .2rem;
}

.calendar-title {
    width: .8rem;
    height: .8rem;
    padding: .1rem;
}

.calendar-day.current {
    outline: 2px solid #db8e3090;
}

.current-fixed .calendar-day.current {
    outline-width: 3px;
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
