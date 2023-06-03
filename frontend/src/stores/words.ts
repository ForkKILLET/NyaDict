import { defineStore } from 'pinia' 
import { ref } from 'vue'
import { randomItem } from '../utils'
import { getStorage, setStorage } from '../utils/storage'
import type { ITestRec, IWord } from '../types'

export const useWords = defineStore('words', () => {
    const words = ref<IWord[]>(getStorage('words') ?? [
        {
            id: 0,
            disp: 'ニャディクト',
            sub: 'Nya Dict',
            desc: '',
            mem: emptyMem()
        }
    ])

    const save = () => {
        setStorage('words', words.value)
    }

    const add = (word: Omit<IWord, 'id'>) => {
        const id = (words.value.at(-1)?.id ?? -1) + 1
        if (words.value.some(i => i.disp === word.disp)) return false
        words.value.push({ ...word, id })
        save()
    }

    const modify = (word: IWord) => {
        const oldIndex = words.value.findIndex(i => i.id === word.id)
        if (oldIndex >= 0) words.value[oldIndex] = word
        else words.value.push(word)
        save()
    }

    const merge = (words: IWord[]) => {
        words.forEach(word => modify(word))
    }

    const getById = (id: number | undefined): IWord | undefined => {
        if (id === undefined) return
        return words.value.find(word => word.id === id)
    }

    const addTestRec = (id: number, rec: ITestRec) => {
        const word = getById(id)
        if (! word) return false
        word.mem.testRec.push(rec)
        if (rec.correct) word.mem.correctNum ++
        else word.mem.wrongNum ++
        save()
        return true
    }

    const randomWord = () => randomItem(words.value)

    return {
        words,
        save, add, modify, merge,
        getById, addTestRec, randomWord
    }
})

export const emptyMem = () => ({
    correctNum: 0,
    wrongNum: 0,
    createTime: Date.now(),
    testRec: []
})
