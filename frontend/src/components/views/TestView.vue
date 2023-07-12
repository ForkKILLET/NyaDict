<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useWords } from '@store/words'
import { useTest } from '@store/test'
import { add, remove } from '@util/notif'
import type { ITestMode, ITest, ICorrect, IWord } from '@type'

import Word from '@comp/Word.vue'
import Correctness from '@comp/Correctness.vue'
import NyaDate from '@comp/NyaDate.vue'
import WordDetail from '@comp/WordDetail.vue'
import WordList from '@comp/WordList.vue'

const wordsStore = useWords()
const testStore = useTest()
const { currentTest: existingTest } = storeToRefs(testStore)

const testModeInfo: Record<ITestMode, string> = {
    disp: '書き方',
    sub: '読み方'
}
const testMode = ref<ITestMode | null>(null)
const testSize = ref(20)

const currentTest = ref<ITest>()
const testConfirmed = ref(false)

const showAnswer = ref(false)
const showDetail = ref(false)

const testCorrectCount = ref(0)
const testHalfCorrectCount = ref(0)
const testWrongCount = ref(0)

const missWords = ref<IWord[]>()

const showMiss = () => {
    const test = currentTest.value!
    missWords.value ??= test.wordIds
        .filter((_, index) => test.correctness[index] !== 1)
        .map(id => wordsStore.getById(id)!)
}

const currentWord = computed(() => wordsStore.getById(
    currentTest.value?.wordIds[currentTest.value.currentIndex]
))

const useExistingTest = () => {
    const test = existingTest.value!
    currentTest.value = test
    testMode.value = test.mode
    testSize.value = test.wordIds.length
    testConfirmed.value = true
    if (currentTest.value.completed) completeTest()
}

const ableToCreateTest = computed(() => (
    !! testMode.value &&
    0 < testSize.value && testSize.value <= testStore.testableWords.length
))

const createTest = () => {
    if (! ableToCreateTest.value) {
        add({
            type: 'error',
            content: ! testMode.value
                ? 'テスト・モードを選んでください'
                : '単語数を正く入力してください',
            duration: 2 * 1000
        })
        return
    }
    currentTest.value = testStore.generateTest(testMode.value!, testSize.value)
}

const dropLastTest = () => {
    existingTest.value = undefined
    testStore.save()
}

const completeTest = () => {
    testCorrectCount.value = 0
    testWrongCount.value = 0
	testHalfCorrectCount.value = 0

    const { correctness } = currentTest.value!
    for (const correct of correctness) {
        if (correct === 0) testWrongCount.value ++
        else if (correct === 1) testCorrectCount.value ++
        else testHalfCorrectCount.value ++
    }
}

const disposeTest = () => {
    dropLastTest()
    currentTest.value = undefined
    testMode.value = null
}

const nid = ref<number>()

const nextWord = (correct: ICorrect) => {
    if (showDetail.value) showDetail.value = false
    showAnswer.value = false

    const word = currentWord.value!
    const test = currentTest.value!

    if (test.currentIndex < test.maxIndex) {
        const { oldEasiness } = wordsStore.popTestRec(word)!
        word.mem.easiness = oldEasiness
    }
    else {
        test.maxIndex ++
    }

    const newEasiness = wordsStore.pushTestRec(word, {
        time: Date.now(),
        correct,
        mode: testMode.value!
    })
    test.correctness[test.currentIndex] = correct

    if (nid.value !== undefined) remove(nid.value)
    nid.value = add({
        content: newEasiness.toFixed(2),
        type: 'info',
        style: {
            color: correct === 1 ? '#95e35d' : '#ec4e1e'
        },
        duration: 1 * 1000
    })

    if (++ test.currentIndex === testSize.value) {
        test.completed = true
        testStore.save()
        completeTest()
    }

    testStore.save()
}

const navigateTestedWord = (delta: number) => {
    const test = currentTest.value!
    const nextIndex = test.currentIndex + delta
    if (nextIndex < 0 || nextIndex > test.maxIndex) return
    test.currentIndex = nextIndex
    testStore.save()

    showAnswer.value = false
}
</script>

<template>
    <div class="content">
        <template v-if="! currentTest">
            <div v-if="! existingTest">
                <h2>テスト設定</h2>
                <p>どのテスト・モードにしますか。</p>
                <p v-for="info, mode in testModeInfo">
                    <button
                        class="inline card test-mode"
                        :class="{ active: testMode === mode }"
                        @click="testMode = mode"
                    >
                        {{ info }}
                    </button>
                </p>
                <p>
                    いくつの単語にしますか。 <br />
                    <span class="number">{{ testStore.testableWords.length }}</span>
                    個の単語が今テストできます。
                </p>
                <input
                    v-model="testSize"
                    type="number" min="0" :max="testStore.testableWords.length"
                    placeholder="単語数"
                    class="w1 card center"
                />
                <p>
                    <button
                        class="inline card"
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
                    <NyaDate :date="existingTest.createTime" /> に作成 ・
                    <NyaDate :date="existingTest.accessTime" /> にアクセス
                </p>
                <p>
                    プログレス
                    <span class="test-progress-number">{{ existingTest.currentIndex }}</span> /
                    <span class="test-progress-number">{{ existingTest.wordIds.length }}</span>
                </p>
                <p>
                    <button
                        class="inline w1 card"
                        @click="useExistingTest"
                    >続く</button>
                    <button
                        class="inline w1 card"
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
                    class="inline card"
                    @click="testConfirmed = true"
                >スタート！</button>
            </p>
        </div>
        <template v-else>
            <span class="test-progress-message">
                <fa-icon
                    @click="navigateTestedWord(- 1)"
                    icon="circle-arrow-left"
                    class="button"
                    :class="{ disabled: currentTest.currentIndex === 0 }"
                />
                <span class="test-progress-number">{{ currentTest.currentIndex }}</span> /
                <span class="test-progress-number">{{ testSize }}</span>
                <fa-icon
                    @click="navigateTestedWord(+ 1)"
                    icon="circle-arrow-right"
                    class="button"
                    :class="{ disabled: currentTest.currentIndex >= currentTest.maxIndex }"
                />
            </span>
            <div class="test-progress-bar">
                <div
                    class="test-progress-inner"
                    :style="{ width: (100 / testSize! * currentTest.currentIndex) + 'vw' }"
                ></div>
            </div>
            <div v-if="currentTest.completed" class="completed-area">
                <h2>テスト・クリヤー！</h2>
                <p>
                    <Correctness
                        :correct="testCorrectCount"
                        :half-correct="testHalfCorrectCount"
                        :wrong="testWrongCount"
                        :show-acc="true"
                        :show-count="true"
                        :show-ring="true"
                    />
                </p>
                <p>
                    <button
                        class="inline w2 card"
                        @click="showMiss"
                    >
                        今度の間違い
                    </button>
                    <button
                        class="inline w1 card"
                        @click="disposeTest"
                    >
                        <fa-icon icon="arrow-right" class="button no-animation" />
                    </button>
                </p>
                <WordList v-if="missWords" :words="missWords" />
            </div>
            <div v-else-if="! showAnswer" class="test-area">
                <div>
                    <span class="question">{{ currentWord![testMode!] }}</span>
                </div>
                <p>
                    <button
                        class="inline w3 card"
                        @click="showAnswer = true"
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
                        class="inline w1 card"
                        @click="nextWord(1)"
                    >
                        <fa-icon icon="check-circle" class="correct" />
                    </button>
                    <button
                        class="inline w1 card"
                        @click="nextWord(0.5)"
                    >
                        <fa-icon icon="circle-question" />
                    </button>
                    <button
                        class="inline w1 card"
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
    display: flex;
    flex-flow: column;
    height: calc(100vh - 3.5rem);
    box-sizing: border-box;
    text-align: center;
    align-items: center;
}

.test-area {
    height: 100%;
    margin: 1.5rem -1em 0 -1em;
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

.test-progress-message {
    display: inline-block;
    height: 1.5em;
    margin-bottom: .5em;
}

.test-progress-bar {
    width: 100vw;
    height: 10px;
    background-color: #eee;
}

.test-progress-number {
    color: #8358f9;
}

.test-progress-inner {
    height: 10px;
    background-color: #8358f9;
}

:deep(.word-disp), :deep(.word-sub) {
    font-size: 1.3em;
}

.question {
    font-family: var(--ja-serif);
    font-size: 3em;
}

.choose-correctness {
    white-space: nowrap;
}

.completed-area {
    display: flex;
    flex-flow: column;
    height: calc(100% - 2em - 10px);
    overflow: hidden;
}

.word-detail {
    width: 80%;
    min-width: min(calc(100vw - 3em), 30em);
    margin: 1em 0;
    text-align: left;
}

.completed-area > .word-list {
    flex: 1;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    overflow-y: auto;
    scrollbar-width: none;
}

.completed-area > .word-list::-webkit-scrollbar {
    display: none;
}
</style>
