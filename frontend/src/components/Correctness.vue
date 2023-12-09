<script setup lang="ts">
import { computed } from 'vue'
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
    <div class="corr">
        <span
            v-if="showRing"
            class="ring"
        >
            <svg
                width="1em"
                height="1em"
                viewBox="0 0 20 20"
            >
                <circle
                    cx="10"
                    cy="10"
                    r="7"
                />
                <circle
                    cx="10"
                    cy="10"
                    r="8"
                    stroke="#eee"
                    stroke-width="3"
                />
                <g
                    v-if="total"
                    class="segments"
                >
                    <circle
                        cx="10"
                        cy="10"
                        r="8"
                        stroke="var(--color-correct)"
                        stroke-width="3"
                        v-bind="arc(correct / total)"
                    />
                    <circle
                        cx="10"
                        cy="10"
                        r="8"
                        stroke="var(--color-half-correct)"
                        stroke-width="3"
                        v-bind="arc(halfCorrect / total)"
                    />
                    <circle
                        cx="10"
                        cy="10"
                        r="8"
                        stroke="var(--color-wrong)"
                        stroke-width="3"
                        v-bind="arc(wrong / total)"
                    />
                </g>
            </svg>
        </span>
        <span
            class="count"
            :class="{ hide: ! showCount }"
        >
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
            <span
                v-if="showAcc"
                class="number"
            >
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
.corr {
    position: relative;
    display: inline-block;
    white-space: nowrap;
}

.count {
    vertical-align: bottom;
}

.count > .number {
    padding: 0 .4rem;
}
.count > .number > span {
    margin-left: .2em;
}

.ring  {
    display: inline-block;
    margin: -.5em;
    padding: .5em;
    vertical-align: baseline;
}

.ring circle {
    fill: transparent;
}

.count.hide {
    display: none;
    position: absolute;
    right: 0;
    bottom: 100%;

    padding: .2em;
    border-radius: .5em;
    background: var(--color-bg);
    box-shadow: 0 0 .4em var(--color-shad-ui);
}

.ring:hover + .count.hide {
    display: block;
}
</style>
