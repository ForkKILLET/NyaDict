<script setup lang="ts">
import { ref } from 'vue'
import { useWords } from '../../stores/words'
import { IWord } from '../../types/data'
import { randomItem } from '../../utils'

import Card from '../Card.vue'
import Word from '../Word.vue'

type TestMode = 'disp' | 'sub' | 'desc'
const testModeInfo: Record<TestMode, string> = {
    disp: '書き方によって',
    sub: '読み方によって',
    desc: '解　釈によって',
}

const testMode = ref<TestMode | null>(null)
const wordsStore = useWords()
const currentWord = ref<IWord>()
const answerShowed = ref(false)

const drawWord = () => {
    const { words } = wordsStore
    currentWord.value = randomItem(words)
}

const setMode = (mode: TestMode) => {
    testMode.value = mode
    drawWord()
}
</script>

<template>
    <div v-if="! testMode">
        <p v-for="info, mode in testModeInfo">
            <Card class="button" @click="setMode(mode)">
                &gt; {{ info }}
            </Card>
        </p>
    </div>
    <div v-else-if="! answerShowed" class="testarea">
        <span class="question">{{ currentWord![testMode] }}</span>
        <Card
            class="button"
            @click="answerShowed = true"
        >答えを見る</Card>
    </div>
    <div v-else class="testarea">
        <p><Word :word="currentWord!"></Word></p>
        <Card
            class="button"
            @click="answerShowed = false; drawWord()"
        >次へ</Card>
    </div>
</template>
    
<style scoped>
.testarea {
    text-align: center;
}

.question {
    font-family: serif;
    font-size: 3em;
}
</style>
