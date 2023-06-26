<script setup lang="ts">
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import type { IMemMode, IMemory } from '../types'
import WordMemBrief from './WordMemBrief.vue'

const props = defineProps<{
    mem: IMemory
}>()

const calendarMode = ref<IMemMode>('both')
const calendarModeInfo: Record<IMemMode, string> = {
    disp: '書き方',
    sub: '読み方',
    both: '合計'
}

type DayState = 'none' | 'idle' | 'correct' | 'wrong' | 'both' | 'half-correct'

const createDay = computed(() => dayjs(props.mem.createTime).startOf('day'))
const startDay = computed(() => {
    const today = dayjs().startOf('day')
    const totalDays = today.diff(createDay.value, 'day') + 1
    if (totalDays < 14)
        return createDay.value.subtract(14 - totalDays, 'day')
    return createDay.value
})

const days = computed(() => {
    const today = dayjs()
    const dates = []
    const days: Record<number, DayState> = {}
    for (
        let day = startDay.value;
        ! day.isAfter(today, 'day');
        day = day.add(1, 'day')
    ) {
        const date = + day.startOf('day')
        days[date] = day.isBefore(createDay.value) ? 'none' : 'idle'
        dates.push(date)
    }
    for (const rec of props.mem.testRec) {
        if (calendarMode.value !== 'both' && rec.mode !== calendarMode.value) continue
        const date = + dayjs(rec.time).startOf('day')
        const state = rec.correct === 1 ? 'correct' : rec.correct === 0 ? 'wrong' : 'half-correct'
        if (days[date] === 'idle') days[date] = state
        else if (days[date] !== state) days[date] = 'both'
    }
    return dates.map(date => days[date])
})
</script>

<template>
    <div class="glowing calendar">
        <div class="calendar-modes">
            <span
                v-for="modeInfo, mode in calendarModeInfo"
                @click="calendarMode = mode"
                class="badge"
                :class="{ active: calendarMode === mode }"
            >{{ modeInfo }}</span>
        </div>
        <WordMemBrief
            :mem="mem"
            :show-acc="true"
            :show-half-correct="true"
            :mem-mode="calendarMode"
        />
        <div class="calendar-inner">
            <div class="calendar-title" v-for="text of [...'日月火水木金土']">{{ text }}</div>
            <div class="pad" :style="{ width: '1em', height: startDay.day() + 'em' }"></div>
            <div v-for="day of days" class="calendar-day" :class="day"></div>
        </div>
    </div>
</template>

<style scoped>
.calendar-inner {
    display: flex;
    flex-flow: column;
    flex-wrap: wrap;
    align-content: start;
    height: 7em;
}
.calendar-title {
    font-size: .7em;
    line-height: 1;
}
.calendar-day, .calendar-title {
    width: .8rem;
    height: .8rem;
    border-radius: .2rem;
    margin: .1rem;
}
.calendar-day.none {
    background-color: #eee;
}
.calendar-day.idle {
    background-color: #aaa;
}
.calendar-day.correct {
    background-color: #95e35d;
}
.calendar-day.half-correct {
    background-color: #db8e30;
}
.calendar-day.wrong {
    background-color: #ec4e1e;
}
.calendar-day.both {
    background: linear-gradient(-45deg, #95e35d 50%, #ec4e1e 50%);;
}
</style>
