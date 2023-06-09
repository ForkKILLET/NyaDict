import { defineStore } from 'pinia' 
import { computed, ref } from 'vue'
import { useWords } from '@store/words'
import { getStorage, setStorage } from '@util/storage'
import { sample } from '@util'
import type { ITest, ITestMode } from '@type'

export const useTest = defineStore('test', () => {
    const wordsStore = useWords()

    const currentTest = ref<ITest | undefined>(getStorage('currentTest'))

    const save = () => {
        setStorage('currentTest', currentTest.value)
    }

    const testableWords = computed(() => {
        const now = Date.now()
        return wordsStore.words.filter(word => {
            const { testAfter } = word.mem
            return ! testAfter || testAfter < now
        })
    })

    const generateTest = (mode: ITestMode, size = 20) => {
        const testableWordIds = testableWords.value.map(word => word.id)
        const wordIds = sample(testableWordIds, size)

        const test: ITest = {
            createTime: Date.now(),
            accessTime: Date.now(),
            mode,
            wordIds,
            maxIndex: 0,
            currentIndex: 0,
            correctness: [],
            completed: false
        }

        currentTest.value = test
        save()
        return test
    }

    return {
        currentTest,
        save, testableWords, generateTest
    }
})

export type RelativeTestTime = '今' | '一日後' | '二日後' | '三日後'

export const getRelativeTestTime = (time: number, now: number) => {
    if (! time) return '今'
    const delta = time - now
    if (delta <= 0) return '今'
    if (delta < 24 * 3600_000) return '一日後'
    if (delta < 2 * 24 * 3600_000) return '二日後'
    return '三日後'
}

export const relativeTestTimeColors: Record<
    ReturnType<typeof getRelativeTestTime>, string
> = {
    '今': '#39d353',
    '一日後': '#61dc75',
    '二日後': '#88e598',
    '三日後': '#b0edba'
}
