<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useWords } from '@store/words'
import { useTest } from '@store/test'
import { ITestMode, ITest, ICorrect, IWord } from '../../types'

import Word from '../Word.vue'
import Correctness from '../Correctness.vue'
import NyaDate from '../NyaDate.vue'
import WordDetail from '../WordDetail.vue'
import WordList from '../WordList.vue'
import { add } from '../../utils/notif'

const wordsStore = useWords()
const testStore = useTest()
const { currentTest } = storeToRefs(testStore)

const testModeInfo: Record<ITestMode, string> = {
    disp: '書き方',
    sub: '読み方'
}
const testMode = ref<ITestMode | null>(null)
const testSize = ref(20)

const test = ref<ITest>()
const testConfirmed = ref(false)

const answerShowed = ref(false)
const showDetail = ref(false)

const testCorrectCount = ref(0)
const testHalfCorrectCount = ref(0)
const testWrongCount = ref(0)

const missWords = ref<IWord[]>()

const showMiss = () => {
    missWords.value ??= test.value!.wordIds
        .filter((_, index) => test.value!.correctness[index] !== 1)
        .map(id => wordsStore.getById(id)!)
}

const currentWord = computed(() => wordsStore.getById(
    test.value?.wordIds[test.value.currentIndex]
))

const useLastTest = () => {
    testMode.value = currentTest.value!.mode
    testSize.value = currentTest.value!.wordIds.length
    test.value = currentTest.value!
    testConfirmed.value = true
    if (test.value.completed) completeTest()
}

const ableToCreateTest = computed(() => (
    !! testMode.value && 0 < testSize.value && testSize.value < wordsStore.words.length
))

const createTest = () => {
    if (! ableToCreateTest.value) {
        add({
            type: 'error',
            content: ! testMode.value
                ? 'テスト・モードを選んでください'
                : '単語数を入力してください',
            duration: 2 * 1000
        })
        return
    }
    test.value = testStore.generateTest(testMode.value!, testSize.value)
}

const dropLastTest = () => {
    currentTest.value = undefined
    testStore.save()
}

const completeTest = () => {
    testCorrectCount.value = 0
    testWrongCount.value = 0
	testHalfCorrectCount.value = 0
    for (const correct of test.value!.correctness) {
        if (correct === 0) testWrongCount.value ++
        else if (correct === 1) testCorrectCount.value ++
        else testHalfCorrectCount.value ++
    }
}

const disposeTest = () => {
    dropLastTest()
    test.value = undefined
    testMode.value = null
}

const nextWord = (correct: ICorrect) => {
    if (showDetail.value) showDetail.value = false
    answerShowed.value = false

    wordsStore.addTestRec(currentWord.value!.id, {
        time: Date.now(),
        correct,
        mode: testMode.value!
    })
    test.value!.correctness.push(correct)

    if (++ test.value!.currentIndex === testSize.value) {
        test.value!.completed = true
        testStore.save()
        completeTest()
    }

    testStore.save()
}
</script>

<template>
    <div class="content">
        <template v-if="! test">
            <div v-if="! currentTest">
                <h2>テスト設定</h2>
                <p>どのテスト・モードにしますか？</p>
                <p v-for="info, mode in testModeInfo">
                    <button
                        class="inline button card test-mode"
                        :class="{ active: testMode === mode }"
                        @click="testMode = mode"
                    >
                        {{ info }}
                    </button>
                </p>
                <p>いくつの単語にしますか？</p>
                <input
                    v-model="testSize"
                    type="number" min="0" :max="wordsStore.words.length"
                    placeholder="単語数"
                    class="w1 card"
                />
                <p>
                    <button
                        class="inline button card"
                        :class="{ disabled: ! ableToCreateTest }"
                        @click="createTest"
                    >
                        <fa-icon icon="arrow-right" class="button no-animation" />
                    </button>
                </p>
            </div>
            <div v-else>
                <h2>終わらないテストがあります</h2>
                <p>
                    <NyaDate :date="currentTest.createTime" /> に作成 ・
                    <NyaDate :date="currentTest.accessTime" /> にアクセス
                </p>
                <p>
                    プログレス
                    <span class="number">{{ currentTest.currentIndex }}</span> /
                    <span class="number">{{ currentTest.wordIds.length }}</span>
                </p>
                <p>
                    <button
                        class="inline w1 button card"
                        @click="useLastTest"
                    >続く</button>
                    <button
                        class="inline w1 button card"
                        @click="dropLastTest"
                    >捨てる</button>
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
                <button
                    class="inline button card"
                    @click="testConfirmed = true"
                >スタート！</button>
            </p>
        </div>
        <template v-else>
            <span class="test-progress-text">
                <span>{{ test.currentIndex }}</span> / <span>{{ testSize }}</span></span>
            <div class="test-progress">
                <div
                    class="test-progress-inner"
                    :style="{ width: (100 / testSize! * test.currentIndex) + 'vw' }"
                ></div>
            </div>
            <div v-if="test.completed" class="completed-area">
                <h2>テスト・クリヤー！</h2>
                <p>
                    <Correctness
                        :correct="testCorrectCount"
                        :half-correct="testHalfCorrectCount"
                        :wrong="testWrongCount"
                        :show-acc="true"
                        :show-half-correct="true"
                    />
                </p>
                <p>
                    <button
                        class="inline w2 button card"
                        @click="showMiss"
                    >
                        今度の間違い
                    </button>
                    <button
                        class="inline w1 button card"
                        @click="disposeTest"
                    >
                        <fa-icon icon="arrow-right" class="button no-animation" />
                    </button>
                </p>
                <WordList v-if="missWords" :words="missWords" />
            </div>
            <div v-else-if="! answerShowed" class="test-area">
                <div>
                    <span class="question">{{ currentWord![testMode!] }}</span>
                </div>
                <p>
                    <button
                        class="inline w3 button card"
                        @click="answerShowed = true"
                    >答案を見る</button>
                </p>
            </div>
            <div v-else class="test-area">
                <div>
                    <Word class="inline" :word="currentWord!">
                        <fa-icon
                            @click="showDetail = ! showDetail"
                            class="button"
                            icon="arrow-circle-right"
                        />
                    </Word>
                </div>
                <p class="choose-correctness">
                    <button
                        class="inline w1 button card"
                        @click="nextWord(1)"
                    >
                        <fa-icon icon="check-circle" class="correct" />
                    </button>
                    <button
                        class="inline w1 button card"
                        @click="nextWord(0.5)"
                    >
                        <fa-icon icon="circle-question" />
                    </button>
                    <button
                        class="inline w1 button card"
                        @click="nextWord(0)"
                    >
                        <fa-icon icon="times-circle" class="wrong" />
                    </button>
                </p>
                <WordDetail v-if="showDetail" :word="currentWord!" />
            </div>
        </template>
    </div>
</template>
    
<style scoped>
.content {
    text-align: center;
    height: calc(100vh - 5.5em);
}

.test-area {
    height: 100%;
    margin: 0 -1em;
    padding: 1em;
    overflow-y: auto;
    scrollbar-width: none;
}
.test-area::-webkit-scrollbar {
    display: none;
}

.test-area > div:first-child {
    height: 12em;
    flex-shrink: 0;
}

.test-area > p {
    margin: .5em 0;
    height: 3em;
}

.test-progress {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100vw;
    height: 10px;
    background-color: #eee;
}

.test-progress-text {
    position: fixed;
    bottom: 10px;
    left: 50vw;
    transform: translateX(-50%);
}
.test-progress-text > span {
    color: #8358f9;
}

.test-progress-inner {
    height: 10px;
    background-color: #8358f9;
}

.word {
    font-size: 1.3em;
}

.question {
    font-family: var(--ja-serif);
    font-size: 3em;
}

.choose-correctness {
    white-space: nowrap;
}

.word-detail {
    flex: 1;
    width: 80%;
    min-width: 600px;
    margin: 2em auto;
    text-align: left;
}

.completed-area > .word-list {
    max-width: 600px;
    margin: 0 auto;
}
</style>
