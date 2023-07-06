<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    correct: number
    halfCorrect: number
    wrong: number

    showAcc?: boolean
    showCount: boolean
    showRing: boolean
}>()

const total = computed(() => props.correct + props.halfCorrect + props.wrong)

const radius = 8
const perimeter = 2 * Math.PI * radius
</script>

<template>
    <div class="correctness">
        <span v-if="showRing" class="ring">
            <svg width="20" height="20">
                <circle
                    cx="10" cy="10" :r="String(radius - 1)"
                    fill="transparent"
                ></circle>
                <circle
                    cx="10" cy="10" :r="String(radius)"
                    fill="transparent" stroke="#eee" stroke-width="3"
                ></circle>
                <template v-if="total">
                    <circle
                        cx="10" cy="10" :r="String(radius)"
                        fill="transparent" stroke="#95e35d" stroke-width="3"
                        :stroke-dasharray="String(perimeter * correct / total) + ' ' + String(perimeter * (1 - correct / total))"
                        :stroke-dashoffset="String(perimeter * .25)"
                    ></circle>
                    <circle
                        cx="10" cy="10" :r="String(radius)"
                        fill="transparent" stroke="#db8e30" stroke-width="3"
                        :stroke-dasharray="String(perimeter * halfCorrect / total) + ' ' + String(perimeter * (1 - halfCorrect / total))"
                        :stroke-dashoffset="String(perimeter * (.25 - correct / total))"
                    ></circle>
                    <circle
                        cx="10" cy="10" :r="String(radius)"
                        fill="transparent" stroke="#ec4e1e" stroke-width="3"
                        :stroke-dasharray="String(perimeter * wrong / total) + ' ' + String(perimeter * (1 - wrong / total))"
                        :stroke-dashoffset="String(perimeter * (.25 - (correct + halfCorrect) / total))"
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
        </span>
    </div>
</template>

<style scoped>
.number {
    padding: 0 .4rem;
}
.number > span {
    margin-left: .2em;
}

.correctness {
    position: relative;
    display: inline-block;
}

.ring  {
    display: inline-block;
    height: 20px;
    vertical-align: baseline;
}

.count {
    vertical-align: bottom;
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
