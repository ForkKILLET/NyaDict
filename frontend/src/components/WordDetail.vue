<script setup lang="ts">
import { useWords } from '../stores/words'
import type { IWord } from '../types'
import NyaDate from './NyaDate.vue'
import LongPressButton from './LongPressButton.vue'
import WordMemCalendar from './WordMemCalendar.vue'

const wordsStore = useWords()

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
        <p>
            <LongPressButton
                v-if="wordsStore.getById(word.id)"
                @long-press="wordsStore.withdraw(word.id); word.id = -1"
                icon="trash"
                color="#ec4e1e"
                :duration="1.5"
            />
            <LongPressButton
                v-else
                @long-press="word.id = wordsStore.add(word)"
                icon="trash-restore"
                color="#db8e30"
                :duration=".5"
            />
        </p>
        <div class="mem-detail">
            <h2>メモリー</h2>
            <div>
                <fa-icon icon="plus" /> <NyaDate :date="word.mem.createTime" />
            </div>
            <div>
                <fa-icon icon="forward" /> <NyaDate :date="word.mem.testAfter" />
            </div>
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
