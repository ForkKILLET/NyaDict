import { defineStore } from 'pinia' 
import { useWords } from './words'
import { ref } from 'vue'
import { ITest, ITestMode } from '../types'
import { getStorage, setStorage } from '../utils/storage'
import { sample } from '../utils'
import dayjs from 'dayjs'

export const useTest = defineStore('test', () => {
    const wordsStore = useWords()

    const currentTest = ref<ITest | undefined>(getStorage('currentTest'))

    const save = () => {
        setStorage('currentTest', currentTest.value)
    }

    const generateTest = (mode: ITestMode, size = 20) => {
        const testedWordIds: number[] = []
        const untestedWordIds: number[] = []
        wordsStore.words.forEach(word => {
            const { testRec } = word.mem
            if (! testRec.length || ! dayjs(testRec.at(-1)!.time).isSame(dayjs(), 'day'))
                untestedWordIds.push(word.id)
            else
                testedWordIds.push(word.id)
        })
        const wordIds = sample(untestedWordIds, size)
        if (wordIds.length < size) wordIds.push(...sample(testedWordIds, size - wordIds.length))

        const test: ITest = {
            createTime: Date.now(),
            accessTime: Date.now(),
            mode,
            wordIds,
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
