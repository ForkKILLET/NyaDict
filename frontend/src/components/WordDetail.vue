<script setup lang="ts">
import type { IWord } from '../types'
import Date from './Date.vue';
import WordMemCalendar from './WordMemCalendar.vue'

defineProps<{
    word: IWord
}>()
</script>

<template>
    <div class="word-detail">
        <p class="word-disp">
            {{ word.disp }}
            <span class="id">{{ word.id }}</span>
        </p>
        <p class="word-sub">{{ word.sub }}</p>
        <div class="mem-detail">
            <h2>メモリー</h2>
            <Date :date="word.mem.createTime" />
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

.calendar {
    width: 80%;
    margin-top: 1em;
}
</style>
