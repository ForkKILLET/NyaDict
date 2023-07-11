<script setup lang="ts">
import { computed } from 'vue';
import { getArc } from '@comp/charts/PieChart.vue'

const props = defineProps<{
    correct: number
    halfCorrect: number
    wrong: number
    easiness?: number

    showAcc?: boolean
    showEasiness?: boolean
    showCount: boolean
    showRing: boolean
}>()

const total = computed(() => props.correct + props.halfCorrect + props.wrong)

const arc = getArc(2 * Math.PI * 8)
</script>

<template>
    <div class="correctness">
        <span v-if="showRing" class="ring">
            <svg width="1em" height="1em" viewBox="0 0 20 20">
                <circle
                    cx="10" cy="10" r="7"
                    fill="transparent"
                ></circle>
                <circle
                    cx="10" cy="10" r="8"
                    fill="transparent" stroke="#eee" stroke-width="3"
                ></circle>
                <template v-if="total">
                    <circle
                        cx="10" cy="10" r="8"
                        fill="transparent" stroke="#95e35d" stroke-width="3"
                        v-bind="arc(correct / total)"
                    ></circle>
                    <circle
                        cx="10" cy="10" r="8"
                        fill="transparent" stroke="#db8e30" stroke-width="3"
                        v-bind="arc(halfCorrect / total)"
                    ></circle>
                    <circle
                        cx="10" cy="10" r="8"
                        fill="transparent" stroke="#ec4e1e" stroke-width="3"
                        v-bind="arc(wrong / total)"
                    ></circle>
                </template>
            </svg>
        </span>
        <span class="count" :class="{ hide: ! showCount }">
            <span class="correct number">
                <fa-icon icon="check-circle" />
                <span>{{ correct }}</span>
            </span>
            <span class="half-correct number">
                <fa-icon icon="circle-question" />
                <span>{{ halfCorrect }}</span>
            </span>
            <span class="wrong number">
                <fa-icon icon="times-circle" />
                <span>{{ wrong }}</span>
            </span>
            <span v-if="showAcc" class="number">
                {{ total
                    ? ((1 - wrong / total) * 100).toFixed(2) + '%'
                    : 'N/A'
                }}
            </span>
            <span v-if="showEasiness">
                EZ[<span class="number">{{ (easiness ?? 0).toFixed(2) }}</span>]
            </span>
        </span>
    </div>
</template>

<style scoped>
.count {
    vertical-align: bottom;
}

.count > .number {
    padding: 0 .4rem;
}
.count > .number > span {
    margin-left: .2em;
}

.correctness {
    position: relative;
    display: inline-block;
}

.ring  {
    display: inline-block;
    margin: -.5em;
    padding: .5em;
    vertical-align: baseline;
}

.count.hide {
    display: none;
    position: absolute;
    right: 0;
    bottom: 100%;

    padding: .2em;
    border-radius: .5em;
    background: #fff;
    box-shadow: 0 0 .4em #faad704d;
}

.ring:hover + .count.hide {
    display: block;
}
</style>
