<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useTest } from '@store/test'
import { getCorrCount, getCorrName, useWord } from '@store/words'
import { useConfig } from '@store/config'

import { addNoti, removeNoti } from '@util/notif'
import { getMainEl } from '@util/dom'

import Word from '@comp/Word.vue'
import Correctness from '@comp/Correctness.vue'
import WordDetail from '@comp/WordDetail.vue'
import WordDocument from '@comp/WordDocument.vue'

import { DocumentKind, TestMode, type ICorrect } from '@type'

const router = useRouter()

const testStore = useTest()
const wordStore = useWord()

const { config } = storeToRefs(useConfig())

const { ongoingTest } = storeToRefs(testStore)
const testSize = computed(() => ongoingTest.value?.wordIds.length)
const hoveringWordIndex = ref<number>()
const hoveringWord = computed(() => {
    if (! ongoingTest.value || ! hoveringWordIndex.value) return
    return wordStore.getById(ongoingTest.value.wordIds[hoveringWordIndex.value])
})

const currentWord = computed(() => wordStore.getById(
    ongoingTest.value?.wordIds[ongoingTest.value.currentIndex]
))
const showAnswer = ref(false)
const nid = ref<number>()

const corrCount = computed(() => getCorrCount(ongoingTest.value!.corrs))

const testCompleted = computed(() => ongoingTest.value!.currentIndex === testSize.value) 

const nextWord = (correct: ICorrect) => {
    showAnswer.value = false

    const test = ongoingTest.value!
    const word = currentWord.value

    if (test.currentIndex < test.maxIndex) {
        if (word) {
            const { oldEasiness } = wordStore.popTestRec(word)!
            word.mem.easiness = oldEasiness
        }
    }
    else {
        test.maxIndex ++
    }

    if (! word) {
        test.currentIndex ++
        return
    }

    const { recId, newEasiness } = wordStore.pushTestRec(word, {
        time: Date.now(),
        correct,
        mode: test.mode,
        testId: test.id
    })
    test.corrs[test.currentIndex] = correct
    test.recIds[test.currentIndex] = recId

    if (nid.value !== undefined) removeNoti(nid.value)
    nid.value = addNoti({
        content: newEasiness.toFixed(2),
        type: 'info',
        style: {
            color: correct === 1 ? 'var(--color-correct)' : 'var(--color-wrong)'
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

    showAnswer.value = test.currentIndex < test.maxIndex
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
    <div
        v-if="ongoingTest && testSize"
        class="content"
    >
        <span class="test-progress-message">
            <fa-icon
                v-if="! ongoingTest.locked"
                icon="circle-arrow-left"
                class="button"
                :class="{ disabled: ongoingTest.currentIndex === 0 }"
                @click="navigateTestedWord(- 1)"
            />
            <span class="order">{{ ongoingTest.currentIndex }}</span> /
            <span class="order">{{ testSize }}</span>
            <fa-icon
                v-if="! ongoingTest.locked"
                icon="circle-arrow-right"
                class="button"
                :class="{ disabled: ongoingTest.currentIndex >= ongoingTest.maxIndex }"
                @click="navigateTestedWord(+ 1)"
            />
        </span>
        <div
            class="test-progress-bar"
            :style="{ height: config.corrProgress ? '15px' : '10px' }"
            @mouseleave="hoveringWordIndex = undefined"
        >
            <template
                v-if="config.corrProgress"
            >
                <div
                    v-for="corr, index of ongoingTest.corrs"
                    :key="index"
                    :style="{
                        width: (100 / testSize) + 'vw',
                        backgroundColor: `var(--color-${getCorrName(corr)})`
                    }"
                    class="test-progress-corr"
                    @mouseover="hoveringWordIndex = index"
                    @click="navigateTestedWord(index - ongoingTest.currentIndex)"
                />
                <Word
                    v-if="hoveringWord"
                    :word="hoveringWord"
                    :show-mem="false"
                    :style="{
                        left: hoveringWordIndex! * (100 / testSize) + 'vw',
                    }"
                    class="hovering-word"
                >
                    <span
                        class="hovering-word-easiness"
                        :class="getCorrName(ongoingTest.corrs[hoveringWordIndex!])"
                    >{{ hoveringWord.mem.easiness.toFixed(2) }}</span>
                </Word>
            </template>
            <div
                v-else
                class="test-progress-inner"
                :style="{ width: (100 / testSize * ongoingTest.currentIndex) + 'vw' }"
            />
        </div>

        <div
            v-if="testCompleted"
            class="completed-area"
        >
            <h2>テスト・クリヤー！</h2>
            <p>
                <Correctness
                    v-bind="corrCount"
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
                    <fa-icon
                        icon="arrow-right"
                        class="button no-animation"
                    />
                </button>
            </p>
        </div>
        <div
            v-else-if="! showAnswer && currentWord"
            class="test-area scroll-y"
        >
            <div class="question">
                <span v-if="ongoingTest.mode === TestMode.Disp">{{ currentWord.disp }}</span>
                <span v-else-if="ongoingTest.mode === TestMode.Sub">{{ currentWord.sub }}</span>
                <template v-else-if="ongoingTest.mode === TestMode.Meaning">
                    <WordDocument
                        v-for="doc of currentWord.docs!.filter(doc => doc.kind === DocumentKind.Meaning)"
                        :key="doc.id"
                        :word="currentWord"
                        :doc="doc"
                        :hide-self="true"
                    />
                </template>
            </div>
            <p>
                <button
                    class="inline w3 card"
                    @click="showAnswer = true"
                >
                    <fa-icon icon="eye" />
                </button>
            </p>
        </div>
        <div
            v-else-if="currentWord"
            class="test-area scroll-y"
        >
            <div class="answer">
                <Word
                    class="inline"
                    :word="currentWord"
                />
            </div>
            <p class="corr-chooser">
                <button
                    class="inline w1 card"
                    @click="nextWord(1)"
                >
                    <fa-icon
                        icon="check-circle"
                        class="correct"
                    />
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
                    <fa-icon
                        icon="times-circle"
                        class="wrong"
                    />
                </button>
            </p>
            <WordDetail
                :word="currentWord"
                :container="getMainEl()"
            />
        </div>
        <div v-else>
            <p>単語は見つかりません。</p>
            <button
                class="inline w1 card"
                @click="nextWord(1)"
            >
                <fa-icon icon="arrow-right" />
            </button>
        </div>
    </div>
    <div v-else>
        <p>今テストしていません。</p>
    </div>
</template>


<style scoped>
.content {
    display: flex;
    flex-flow: column;
    text-align: center;
    align-items: center;
}

.test-area {
    height: 100%;
    width: 80%;
    min-width: min(calc(100vw - 3em), 30em);
    margin: 1.5rem -1em 0 -1em;
    padding: 1em;
}

.question, .answer {
    min-height: 6em;
    margin-bottom: 6em;
}

.question > .word-doc {
    margin-bottom: 1em;
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
    position: relative;
    display: flex;
    width: 100vw;
    height: 0px;
    background-color: var(--color-chart-bg);
}

.test-progress-inner {
    background-color: var(--color-order);
    height: 100%;
    transition: .5s width;
}

.test-progress-corr {
    display: inline-block;
    height: 100%;
}

.hovering-word {
    position: absolute;
    top: calc(100% + .5em);
}
.hovering-word-easiness {
    margin-left: .5em;
}

.answer :deep(.word-disp), .answer :deep(.word-sub) {
    font-size: 1.3em;
}

.question > span {
    font-family: var(--font-ja-serif);
    font-size: 3em;
}

.question > .meaning-doc:first-child {
    margin-top: 2em;
}

.corr-chooser {
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
    margin: 1em 0;
    text-align: left;
}
</style>
