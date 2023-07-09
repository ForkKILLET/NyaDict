import { defineStore } from 'pinia' 
import { ref } from 'vue'
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

    const generateTest = (mode: ITestMode, size = 20) => {
        const now = Date.now()
        const testableWordIds = wordsStore.words
            .filter(word => {
                const { testAfter } = word.mem
                return ! testAfter || testAfter < now
            })
            .map(word => word.id)
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
        save, generateTest
    }
})
