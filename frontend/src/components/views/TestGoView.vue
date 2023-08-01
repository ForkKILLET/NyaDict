<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useTest } from '@/stores/test'
import { useWord } from '@/stores/words'
import { add as addNoti, remove as removeNoti } from '@/utils/notif'
import Word from '@comp/Word.vue'
import Correctness from '@comp/Correctness.vue'
import WordDetail from '@comp/WordDetail.vue'
import type { ICorrect } from '@type'

const router = useRouter()

const testStore = useTest()
const wordStore = useWord()

const { ongoingTest } = storeToRefs(testStore)
const testSize = computed(() => ongoingTest.value?.wordIds.length)

const currentWord = computed(() => wordStore.getById(
    ongoingTest.value?.wordIds[ongoingTest.value.currentIndex]
))
const showAnswer = ref(false)
const showDetail = ref(false)
const nid = ref<number>()

const correctnessCount = computed(() => {
    let correct = 0
    let halfCorrect = 0
    let wrong = 0
    for (const c of ongoingTest.value!.correctness) {
        if (c === 1) correct ++
        else if (c === 0) wrong ++
        else halfCorrect ++
    }
    return {
        correct, halfCorrect, wrong
    }
})

const testCompleted = computed(() => ongoingTest.value!.currentIndex === testSize.value) 

const nextWord = (correct: ICorrect) => {
    if (showDetail.value) showDetail.value = false
    showAnswer.value = false

    const word = currentWord.value!
    const test = ongoingTest.value!

    if (test.currentIndex < test.maxIndex) {
        const { oldEasiness } = wordStore.popTestRec(word)!
        word.mem.easiness = oldEasiness
    }
    else {
        test.maxIndex ++
    }

    const { recId, newEasiness } = wordStore.pushTestRec(word, {
        time: Date.now(),
        correct,
        mode: test.mode
    })
    test.correctness[test.currentIndex] = correct
    test.recIds[test.currentIndex] = recId

    if (nid.value !== undefined) removeNoti(nid.value)
    nid.value = addNoti({
        content: newEasiness.toFixed(2),
        type: 'info',
        style: {
            color: correct === 1 ? '#95e35d' : '#ec4e1e'
        },
        duration: 1 * 1000
    })

    test.currentIndex ++
}

const navigateTestedWord = (delta: number) => {
    const test = ongoingTest.value!
    const nextIndex = test.currentIndex + delta
    if (nextIndex < 0 || nextIndex > test.maxIndex) return
    test.currentIndex = nextIndex

    showAnswer.value = false
}

const endTest = () => {
    const test = ongoingTest.value!
    test.locked = true
    test.lockTime = Date.now()
    testStore.lastTestId = test.id
    router.push('/test')
}
</script>

<template>
    <div v-if="ongoingTest" class="content">
        <span class="test-progress-message">
            <fa-icon
                v-if="! ongoingTest.locked"
                @click="navigateTestedWord(- 1)"
                icon="circle-arrow-left"
                class="button"
                :class="{ disabled: ongoingTest.currentIndex === 0 }"
            />
            <span class="order">{{ ongoingTest.currentIndex }}</span> /
            <span class="order">{{ testSize }}</span>
            <fa-icon
                v-if="! ongoingTest.locked"
                @click="navigateTestedWord(+ 1)"
                icon="circle-arrow-right"
                class="button"
                :class="{ disabled: ongoingTest.currentIndex >= ongoingTest.maxIndex }"
            />
        </span>
        <div class="test-progress-bar">
            <div
                class="test-progress-inner"
                :style="{ width: (100 / testSize! * ongoingTest.currentIndex) + 'vw' }"
            ></div>
        </div>

        <div v-if="testCompleted" class="completed-area">
            <h2>テスト・クリヤー！</h2>
            <p>
                <Correctness
                    v-bind="correctnessCount"
                    :show-acc="true"
                    :show-count="true"
                    :show-ring="true"
                />
            </p>
            <p>
                <button
                    class="inline card"
                    @click="endTest"
                >
                    <fa-icon icon="arrow-right" class="button no-animation" />
                </button>
            </p>
        </div>
        <div v-else-if="! showAnswer" class="test-area">
            <div>
                <span class="question">{{ currentWord![ongoingTest.mode] }}</span>
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
                <Word class="answer inline" :word="currentWord!">
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
    </div>
    <div v-else>
        x
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

.test-progress-inner {
    height: 10px;
    background-color: #8358f9;
}

.answer :deep(.word-disp), .answer :deep(.word-sub) {
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
    align-items: center;
    height: calc(100% - 2em - 10px);
    margin-top: 1.5em;
    overflow: hidden;
}

.word-detail {
    width: 80%;
    min-width: min(calc(100vw - 3em), 30em);
    margin: 1em 0;
    text-align: left;
}
</style>
