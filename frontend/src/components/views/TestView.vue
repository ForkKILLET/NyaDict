<script setup lang="ts">
import { ref } from 'vue'
import { useWords } from '../../stores/words'
import type { IWord, ITestMode } from '../../types/data'

import Card from '../Card.vue'
import Word from '../Word.vue'

const testModeInfo: Record<Partial<ITestMode>, string> = {
    disp: '書き方によって',
    sub: '読み方によって',
    desc: '解　釈によって',
}

const testMode = ref<ITestMode | null>(null)
const wordsStore = useWords()
const currentWord = ref<[ number, IWord ]>()
const answerShowed = ref(false)

const drawWord = () => {
    currentWord.value = wordsStore.randomWord()
}

const nextWord = (correct: boolean) => {
    answerShowed.value = false
    console.log(
        wordsStore.addTestRec(currentWord.value![0], {
            time: Date.now(),
            correct,
            mode: testMode.value!
        })
    )
    drawWord()
}

const setMode = (mode: ITestMode) => {
    testMode.value = mode
    drawWord()
}
</script>

<template>
    <div class="choose-mode" v-if="! testMode">
        <p v-for="info, mode in testModeInfo">
            <Card v-if="mode !== 'desc'" class="inline button" @click="setMode(mode)">
                {{ info }} <fa-icon icon="fa-solid fa-arrow-right" />
            </Card>
        </p>
    </div>
    <div v-else-if="! answerShowed" class="testarea">
        <div>
            <span class="question">{{ currentWord![1][testMode] }}</span>
        </div>
        <Card
            class="inline w2 button"
            @click="answerShowed = true"
        >答えを見る</Card>
    </div>
    <div v-else class="testarea">
        <div>
            <Word class="inline" :word="currentWord![1]"></Word>
        </div>
        <Card
            class="inline w1 button"
            @click="nextWord(true)"
        >正しい</Card>
        <Card
            class="inline w1 button"
            @click="nextWord(false)"
        >間違った</Card>
    </div>
</template>
    
<style scoped>
.choose-mode {
    text-align: center;
}

.testarea {
    text-align: center;
}

.testarea > div:first-child {
    height: 8em;
}

.word {
    font-size: 1.3em;
}

.question {
    font-family: serif;
    font-size: 3em;
}
</style>
