<script setup lang="ts">
import { useWords } from '@/stores/words'
import dayjs from 'dayjs'
import { interpolateRgb } from 'd3-interpolate'

import { gradeBy, gradeColors } from '@/utils'
import NyaDate from '@comp/NyaDate.vue'
import StatisticsItem from '@comp/StatisticsItem.vue'
import Calendar from '@comp/charts/Calendar.vue'
import PieChart, { type PieData } from '@comp/charts/PieChart.vue'
import { RelativeTestTime, getRelativeTestTime, relativeTestTimeColors } from '@/stores/test'

const wordsStore = useWords()

const data = {
    createWord: () => {
        const today = dayjs()

        const dates = []
        const nums: Record<string, number> = {}
        let firstDate: number = Infinity
        let maxCreateNum = 0

        wordsStore.words.forEach((word) => {
            const date = + dayjs(word.mem.createTime).startOf('d')
            if (date < firstDate) firstDate = date
            nums[date] ??= 0
            if (++ nums[date] > maxCreateNum) maxCreateNum = nums[date]
        })

        for (
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
                    kind: gradeBy(num, maxCreateNum),
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
    },
    easiness: () => {
        const { words } = wordsStore
        const total = words.length
        const groups: Record<string, number> = {}
        words.forEach(word => {
            const easiness = (word.mem.easiness ?? 0).toFixed(2)
            groups[easiness] ??= 0
            groups[easiness] ++
        })

        const interpolate = interpolateRgb('#ec4e1e', '#95e35d')
        const data: PieData = Object.entries(groups)
            .map(([ easiness, value ]) => ({
                ratio: value / total,
                value,
                name: easiness,
                color: ''
            }))
            .sort((a, b) => + b.name - + a.name)
        const maxEasiness = + data[0].name
        const minEasiness = + data.at(-1)!.name
        const deltaEasiness = maxEasiness - minEasiness
        data.forEach(item => {
            item.color = interpolate(+ item.name / deltaEasiness)
        })
        return { data }
    },
    testAfter: () => {
        const { words } = wordsStore
        const now = Date.now()
        const total = words.length
        const groups: Record<RelativeTestTime, number> = {
            '今': 0, '一日後': 0, '二日後': 0, '三日後': 0
        }
        words.forEach(word => {
            const { testAfter } = word.mem
            const relative = getRelativeTestTime(testAfter, now)
            groups[relative] ++
        })

        const data: PieData = Object.entries(groups)
            .map(([ relative, value ]) => ({
                ratio: value / total,
                value,
                name: relative,
                color: relativeTestTimeColors[relative as RelativeTestTime]
            }))
            .sort((a, b) => + b.name - + a.name)
        return { data }
    }
}
</script>

<template>
    <div class="content">
        <div class="list">
            <StatisticsItem
                title="単語作成"
                :data="data.createWord"
            >
                <template #default="{ data: { data, firstDate } }">
                    <Calendar
                        :start-day="firstDate.get('d')"
                        :data="data"
                        :colors="gradeColors"
                    >
                        <template #current="{ value }">
                            <div v-if="value">
                                <NyaDate :date="value.date" />
                                に単語を
                                <span class="number">{{ value.num ?? 0 }}</span>
                                個作成しました
                            </div>
                        </template>
                    </Calendar>
                </template>
            </StatisticsItem>

            <StatisticsItem
                title="EZ 分布"
                :data="data.easiness"
            >
                <template #default="{ data: { data } }">
                    <PieChart :data="data" />
                </template>
            </StatisticsItem>

            <StatisticsItem
                title="次のテストの時間"
                :data="data.testAfter"
            >
                <template #default="{ data: { data } }">
                    <PieChart :data="data" />
                </template>
            </StatisticsItem>
        </div>
    </div>
</template>

<style scoped>
.content {
    padding: 0 1em;
	height: calc(100vh - 3.5rem);
    box-sizing: border-box;
	overflow-y: auto;
    scrollbar-width: none;
}
.content::-webkit-scrollbar {
    display: none;
}

.list {
    padding: 1em;
    display: flex;
    flex-flow: wrap;
}
.statistics-item {
    flex: 1;
    margin: 0 1em 1em 0em;
    min-width: 15em;
    max-width: calc(50% - 1em);
}

.calendar:deep(> .calendar-inner) {
    max-width: 50em;
    overflow-x: auto;
}
</style>
