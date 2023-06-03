<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useWords } from '../../stores/words'
import { useTest } from '../../stores/test'
import type { ITestMode, ITest } from '../../types'

import Card from '../Card.vue'
import Word from '../Word.vue'
import Correctness from '../Correctness.vue'
import dayjs from 'dayjs'

const wordsStore = useWords()
const testStore = useTest()
const { currentTest } = storeToRefs(testStore)

const testModeInfo: Record<ITestMode, string> = {
    disp: '書き方',
    sub: '読み方'
}
const testMode = ref<ITestMode | null>(null)

const test = ref<ITest>()
const testConfirmed = ref(false)

const answerShowed = ref(false)

const testCorrectCount = ref(0)
const testWrongCount = ref(0)

const currentWord = computed(() => wordsStore.getById(
    test.value?.wordIds[test.value.currentIndex]
))
const testSize = computed(() => test.value?.wordIds.length)

const useLastTest = () => {
    testMode.value = currentTest.value!.mode
    test.value = currentTest.value!
    testConfirmed.value = true
}

const dropLastTest = () => {
    currentTest.value = undefined
    testStore.save()
}

const completeTest = () => {
    test.value!.completed = true
    for (const correct of test.value!.correctness) {
        (correct ? testCorrectCount : testWrongCount).value ++
    }
}

const nextWord = (correct: boolean) => {
    answerShowed.value = false

    wordsStore.addTestRec(currentWord.value!.id, {
        time: Date.now(),
        correct,
        mode: testMode.value!
    })
    test.value!.correctness.push(correct)

    if (++ test.value!.currentIndex === testSize.value)
        completeTest()

    testStore.save()
}

const setMode = (mode: ITestMode) => {
    testMode.value = mode
    test.value = testStore.generateTest(mode, 5)
}
</script>

<template>
    <div class="test-main">
        <template v-if="! test">
            <div v-if="! currentTest">
                <h2>どのテスト・モードにしますか？</h2>
                <p v-for="info, mode in testModeInfo">
                    <Card class="inline button" @click="setMode(mode)">
                        {{ info }} <fa-icon icon="fa-solid fa-arrow-right" />
                    </Card>
                </p>
            </div>
            <div v-else>
                <h2>終わらないテストがあります</h2>
                <p>
                    <span class="number">{{
                        dayjs(currentTest.createTime).format('YYYY-MM-DD')
                    }}</span> に作成 ・
                    <span class="number">{{
                        dayjs(currentTest.accessTime).format('YYYY-MM-DD')
                    }}</span> にアクセス
                </p>
                <p>
                    プログレス
                    <span class="number">{{ currentTest.currentIndex }}</span> /
                    <span class="number">{{ currentTest.wordIds.length }}</span>
                </p>
                <p>
                    <Card
                        class="inline w1 button"
                        @click="useLastTest"
                    >続く</Card>
                    <Card
                        class="inline w1 button"
                        @click="dropLastTest"
                    >捨てる</Card>
                </p>
            </div>
        </template>
        <div v-else-if="! testConfirmed">
            <h2>今度のテストが作成されました</h2>
            <p>
                合計で <span class="number">{{ testSize }}</span> 単語、
                <em>{{ testModeInfo[testMode!] }}</em>による
            </p>
            <p>
                <Card
                    class="inline button"
                    @click="testConfirmed = true"
                >スタート！</Card>
            </p>
        </div>
        <template v-else>
            <div class="test-progress">
                <div
                    class="test-progress-inner"
                    :style="{ width: (100 / testSize! * test.currentIndex) + 'vw' }"
                ></div>
            </div>
            <div v-if="test.completed">
                <h2>テスト　クリーン！</h2>
                <Correctness :correct="testCorrectCount" :wrong="testWrongCount" />
            </div>
            <div v-else-if="! answerShowed" class="test-area">
                <div>
                    <span class="question">{{ currentWord![testMode!] }}</span>
                </div>
                <Card
                    class="inline w2 button"
                    @click="answerShowed = true"
                >答えを見る</Card>
            </div>
            <div v-else class="test-area">
                <div>
                    <Word class="inline" :word="currentWord!"></Word>
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
    </div>
</template>
    
<style scoped>
.test-main {
    text-align: center;
}
.test-area > div:first-child {
    height: 8em;
}

.test-progress {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100vw;
    height: 10px;
    background-color: #eee;
}

.test-progress-inner {
    height: 10px;
    background-color: #8358f9;
}

.word {
    font-size: 1.3em;
}

.question {
    font-family: serif;
    font-size: 3em;
}
</style>
