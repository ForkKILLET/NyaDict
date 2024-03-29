<script setup lang="ts">
import * as d3 from 'd3-interpolate'
import dayjs from 'dayjs'
import { useCssVar } from '@vueuse/core'

import { getCorrCount, useWord } from '@store/words'
import {
    useTest,
    getRelativeTestTime, relativeTestTimeColors, type RelativeTestTime
} from '@store/test'

import { gradeColors } from '@util'
import { getDecimalHour } from '@util/date'

import NyaDate from '@comp/NyaDate.vue'
import StatisticsItem from '@comp/StatisticsItem.vue'
import Calendar, { getCalendarData } from '@comp/charts/Calendar.vue'
import PieChart, { type PieData } from '@comp/charts/PieChart.vue'
import TimeChart, { type BarData } from '@comp/charts/TimeChart.vue'

import type { ITest } from '@type'

const wordStore = useWord()
const testStore = useTest()

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

        const correctColor = useCssVar('--color-correct')
        const interpolate = d3.interpolateRgb('#000', correctColor.value)
        data.forEach(item => {
            item.color = interpolate((+ item.name / deltaEasiness) ** 0.8)
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
    testWord: () => {
        return getCalendarData(wordStore.words.flatMap(word => word.mem.testRec), testRec => testRec.time)
    },
    testInfo: () => {
        const tests = testStore.tests
        const data: BarData<{
            acc: number
            test: ITest
        }> = tests.map(test => {
            const { acc } = getCorrCount(test.corrs)
            return {
                period: {
                    name: '',
                    startPos: getDecimalHour(dayjs(test.createTime)) / 24,
                    endPos: test.lockTime ? getDecimalHour(dayjs(test.lockTime)) / 24 : null,
                    startColor: 'var(--color-wrong)',
                    endColor: 'var(--color-order)',
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
            <template #default="{ data: { data, firstDate }, actionsEl }">
                <Calendar
                    :start-day="firstDate.get('d')"
                    :has-count="true"
                    :data="data"
                    :colors="gradeColors"
                    :actions-el="actionsEl"
                >
                    <template #current="{ item }">
                        <div v-if="item">
                            <NyaDate :date="item.date" />
                            に単語を
                            <span class="number">{{ item.count ?? 0 }}</span>
                            個作成しました。
                            <template v-if="item.total !== undefined">
                                合計
                                <span class="number">{{ item.total }}</span>
                                個です。
                            </template>
                        </div>
                    </template>
                </Calendar>
            </template>
        </StatisticsItem>

        <StatisticsItem
            title="EZ 分布"
            :data="data.easiness"
        >
            <template #default="{ data: { data }, actionsEl }">
                <PieChart
                    :data="data"
                    :actions-el="actionsEl"
                />
            </template>
        </StatisticsItem>

        <StatisticsItem
            title="次のテストの時間"
            :data="data.testAfter"
        >
            <template #default="{ data: { data }, actionsEl }">
                <PieChart
                    :data="data"
                    :actions-el="actionsEl"
                />
            </template>
        </StatisticsItem>

        <StatisticsItem
            title="テストした単語数"
            :data="data.testWord"
        >
            <template #default="{ data: { data, firstDate }, actionsEl }">
                <Calendar
                    :start-day="firstDate.get('d')"
                    :has-count="true"
                    :data="data"
                    :colors="gradeColors"
                    :actions-el="actionsEl"
                >
                    <template #current="{ item }">
                        <div v-if="item">
                            <NyaDate :date="item.date" />
                            に単語を
                            <span class="number">{{ item.count ?? 0 }}</span>
                            個テストしました
                        </div>
                    </template>
                </Calendar>
            </template>
        </StatisticsItem>

        <StatisticsItem
            title="テスト内訳"
            :data="data.testInfo"
        >
            <template #default="{ data: { data } }">
                <TimeChart
                    :data="data"
                    :height="{ value: 6, unit: 'em' }"
                >
                    <template #current="{ value }">
                        <small v-if="value">
                            <span class="id">{{ value.test.id }}</span>&nbsp;
                            <NyaDate
                                :date="value.test.createTime"
                                format="hh:mm:ss"
                            /> から
                            <NyaDate
                                :date="value.test.lockTime!"
                                format="hh:mm:ss"
                            /> まで、
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
