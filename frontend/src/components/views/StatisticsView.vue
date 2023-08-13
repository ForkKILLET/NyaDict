<script setup lang="ts">
import { interpolateRgb } from 'd3-interpolate'
import dayjs from 'dayjs'
import { getCorrectnessCount, useWord } from '@store/words'
import {
    useTest,
    getRelativeTestTime, relativeTestTimeColors, type RelativeTestTime
} from '@store/test'
import { gradeColors } from '@/utils'
import { getDecimalHour } from '@/utils/date'
import NyaDate from '@comp/NyaDate.vue'
import StatisticsItem from '@comp/StatisticsItem.vue'
import Calendar, { getCalendarData } from '@comp/charts/Calendar.vue'
import PieChart, { type PieData } from '@comp/charts/PieChart.vue'
import TimeChart, { BarData } from '@comp/charts/TimeChart.vue'
import { ITest } from '@type'

const wordStore = useWord()
const testStore = useTest()

const interpolate = interpolateRgb('#ec4e1e', '#95e35d')

const data = {
    createWord: () => {
        return getCalendarData(wordStore.words, word => word.mem.createTime)
    },
    easiness: () => {
        const words = wordStore.words
        const total = words.length
        const groups: Record<string, number> = {}
        words.forEach(word => {
            const easiness = (word.mem.easiness ?? 0).toFixed(2)
            groups[easiness] ??= 0
            groups[easiness] ++
        })

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
        const words = wordStore.words
        const now = Date.now()
        const total = words.length
        const groups: Record<RelativeTestTime, number> = {
            '未テスト': 0, '今': 0, '一日後': 0, '二日後': 0, '三日後': 0
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
    },
    createTest: () => {
        return getCalendarData(testStore.tests, test => test.createTime)
    },
    recentTests: () => {
        const tests = testStore.tests.filter(test => test.lockTime).slice(- 7)
        const data: BarData<{
            acc: number
            test: ITest
        }> = tests.map(test => {
            const { acc } = getCorrectnessCount(test.correctness)
            return {
                period: {
                    name: '',
                    startPos: getDecimalHour(dayjs(test.createTime)) / 24,
                    endPos: getDecimalHour(dayjs(test.lockTime)) / 24,
                    startColor: '#ec4e1e',
                    endColor: '#8358f9',
                },
                point: {
                    pos: 1 - acc,
                    color: '#39d353',
                },
                value: {
                    acc, test
                }
            }
        })

        return { data }
    }
}
</script>

<template>
    <div class="content">
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

        <StatisticsItem
            title="テスト作成"
            :data="data.createTest"
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
                            にテストを
                            <span class="number">{{ value.num ?? 0 }}</span>
                            個作成しました
                        </div>
                    </template>
                </Calendar>
            </template>
        </StatisticsItem>

        <StatisticsItem
            title="最近のテスト"
            :data="data.recentTests"
        >
            <template #default="{ data: { data } }">
                <TimeChart :data="data" :height="{ value: 6, unit: 'em' }">
                    <template #current="{ value }">
                        <small v-if="value">
                            <NyaDate :date="value.test.createTime" format="hh:mm:ss" /> から
                            <NyaDate :date="value.test.lockTime!" format="hh:mm:ss" /> まで、
                            ACC [<span class="number">{{ (value.acc * 100).toFixed(2) }}%</span>]
                        </small>
                    </template>
                </TimeChart>
            </template>
        </StatisticsItem>
    </div>
</template>

<style scoped>
.content {
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
