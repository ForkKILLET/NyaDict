import { defineStore } from 'pinia' 
import { ref } from 'vue'
import { toHiragana, toRomaji} from 'wanakana'
import { randomItem } from '../utils'
import { getStorage, setStorage } from '../utils/storage'
import type { IMemory, ITestRec, IWord } from '../types'

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

    const maxId = ref(0)
    const updateMaxId = () => {
        maxId.value = words.value.length ? Math.max(...words.value.map(word => word.id)) : -1
    }
    updateMaxId()

    const save = () => {
        setStorage('words', words.value)
    }

    const add = (word: Omit<IWord, 'id'>) => {
        const id = ++ maxId.value
        words.value.push({ ...word, id })
        save()
        return id
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
        getById, updateMaxId, addTestRec, randomWord
    }
})

export const emptyMem = () => ({
    correctNum: 0,
    wrongNum: 0,
    createTime: Date.now(),
    testRec: []
})

export const getCorrectness = (mem: IMemory) => {
    const total = mem.correctNum + mem.wrongNum
    return total ? mem.correctNum / total : 0
}

export const getRomaji = (word: IWord) => {
    if (word.sub.match(/[a-z]/)) return toRomaji(word.disp)
    return toRomaji(word.sub)
}

export const getYomikataIndex = (word: IWord) => {
    if (word.sub.match(/[a-z]/)) return toHiragana(word.disp[0]).charCodeAt(0)
    return word.sub[0].charCodeAt(0)
}
