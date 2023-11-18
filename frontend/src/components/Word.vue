<script setup lang="ts">
import type { IWord } from '@type'

import WordMemBrief from '@comp/WordMemBrief.vue'

withDefaults(defineProps<{
    word: IWord
    showMem?: boolean
}>(), {
    showMem: true
})
</script>

<template>
    <div class="word card">
        <div>
            <span class="word-disp">{{ word.disp }}</span>
            <span class="word-sub">{{ word.sub }}</span>
        </div>
        <div class="word-info">
            <WordMemBrief
                v-if="showMem"
                :mem="word.mem"
                :show-count="false"
                :show-ring="true"
            />
            <slot :word="word"></slot>
        </div>
    </div>
</template>

<style scoped>
.word {
    display: flex;
    justify-content: space-between;
}

.word-info:deep(> *) {
    white-space: nowrap;
    vertical-align: baseline;
}
</style>
