<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useWord } from '@/stores/words'
import { useTest } from '@/stores/test'
import NyaCheckbox from '@comp/NyaCheckbox.vue'
import { add as addNoti } from '@/utils/notif'
import type { ITestMode } from '@type'

const router = useRouter()

const wordStore = useWord()
const testStore = useTest()

const testModeInfo: Record<ITestMode, string> = {
    disp: '書き方',
    sub: '読み方'
}

const testMode = ref<ITestMode | null>(null)
const testSize = ref(20)
const untestedOnly = ref(false)

const testableWords = computed(() => {
    const now = Date.now()
    return wordStore.words.filter(word => {
        const { testAfter } = word.mem
        return ! testAfter || (! untestedOnly.value && testAfter < now)
    })
})

const ableToCreateTest = computed(() => (
    !! testMode.value &&
    0 < testSize.value && testSize.value <= testableWords.value.length
))

const createTest = () => {
    if (! ableToCreateTest.value) {
        addNoti({
            type: 'error',
            content: ! testMode.value
                ? 'テスト・モードを選んでください'
                : '単語数を正く入力してください',
            duration: 2 * 1000
        })
        return
    }
    testStore.create(testableWords.value, testMode.value!, testSize.value)

    router.push('/test')
}
</script>

<template>
    <div class="content">
        <h2>テスト設定</h2>
        <div>
            <p>テスト・モード</p>
            <button v-for="info, mode in testModeInfo"
                class="inline w1 card test-mode"
                :class="{ active: testMode === mode }"
                @click="testMode = mode"
            >
                {{ info }}
            </button>
        </div>
        <div>
            <p>フィルタ</p>
            <NyaCheckbox v-model="untestedOnly">未テストだけ</NyaCheckbox>
        </div>
        <div>
            <p>単語数</p>
            <p>（今 <span class="number">{{ testableWords.length }}</span>
            個の単語がテストできます。）</p>
            <input
                v-model="testSize"
                type="number" min="0" :max="testableWords.length"
                placeholder="単語数"
                class="w1 card center"
            />
        </div>
        <div>
            <button
                class="inline card"
                :disabled="! ableToCreateTest"
                @click="createTest"
            >
                <fa-icon icon="arrow-right" class="button no-animation" />
            </button>
        </div>
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

.content > div {
    margin: 1em 0;
}

.content > div > p:first-child {
    font-size: 1.2em;
}
</style>