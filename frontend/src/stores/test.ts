import { defineStore } from 'pinia' 
import { useWords } from './words'
import { ref } from 'vue'
import { ITest, ITestMode } from '../types'
import { getStorage, setStorage } from '../utils/storage'
import { sample } from '../utils'

export const useTest = defineStore('test', () => {
    const wordsStore = useWords()

    const currentTest = ref<ITest | undefined>(getStorage('currentTest'))

    const save = () => {
        setStorage('currentTest', currentTest.value)
    }

    const generateTest = (mode: ITestMode, size = 20) => {
        const wordIds = sample(wordsStore.words, size).map(word => word.id)

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
