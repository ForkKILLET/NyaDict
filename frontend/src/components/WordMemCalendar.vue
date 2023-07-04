<script setup lang="ts">
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import type { IMemMode, IMemory } from '@type'
import WordMemBrief from '@comp/WordMemBrief.vue'
import Calendar from '@comp/charts/Calendar.vue'

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

const createDay = computed(() => dayjs(props.mem.createTime).startOf('d'))
const startDate = computed(() => {
    const today = dayjs().startOf('d')
    const totalDays = today.diff(createDay.value, 'd') + 1
    if (totalDays < 14)
        return createDay.value.subtract(14 - totalDays, 'd')
    return createDay.value
})

const data = computed(() => {
    const today = dayjs()
    const dates = []
    const kinds: Record<number, DayState> = {}
    for (
        let day = startDate.value;
        ! day.isAfter(today, 'd');
        day = day.add(1, 'd')
    ) {
        const date = + day.startOf('d')
        kinds[date] = day.isBefore(createDay.value) ? 'none' : 'idle'
        dates.push(date)
    }
    for (const rec of props.mem.testRec) {
        if (calendarMode.value !== 'both' && rec.mode !== calendarMode.value) continue
        const date = + dayjs(rec.time).startOf('d')
        const state = rec.correct === 1 ? 'correct' : rec.correct === 0 ? 'wrong' : 'half-correct'
        if (kinds[date] === 'idle') kinds[date] = state
        else if (kinds[date] !== state) kinds[date] = 'both'
    }
    return dates.map(date => ({
        kind: kinds[date]
    }))
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
        <Calendar
            :start-day="startDate.day()"
            :data="data"
            :colors="{
                idle: '#aaa',
                correct: '#95e35d',
                'half-correct': '#db8e30',
                wrong: '#ec4e1e',
                both: 'linear-gradient(-45deg, #95e35d 50%, #ec4e1e 50%)'
            }"
        />
    </div>
</template>

<style scoped>

</style>
