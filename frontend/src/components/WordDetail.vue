<script setup lang="ts">
import type { IWord } from '../types/data'
import WordMemBrief from './WordMemBrief.vue'
import WordMemCalendar from './WordMemCalendar.vue';

defineProps<{
    word: IWord
}>()
</script>

<template>
    <div class="word-detail">
        <p class="word-disp">{{ word.disp }}</p>
        <p class="word-sub">{{ word.sub }}</p>
        <div class="mem-detail">
            <h2>メモリー</h2>
            <span class="number">{{
                new Date(word.mem.createTime).toLocaleString('ja', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday:'short'
                })
            }}</span>
            <WordMemBrief :mem="word.mem" />
            <WordMemCalendar :mem="word.mem" />
        </div>
    </div>
</template>

<style scoped>
.word-disp {
    margin: 0;
    font-size: 2em;
    font-weight: bold;
}

.word-sub {
    margin: 0;
}
</style>
