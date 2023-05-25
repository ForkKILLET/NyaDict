import { defineStore } from 'pinia' 
import { reactive } from 'vue'
import { tryJSON } from '../utils'

import type { IWord } from '../types/data'

export const useWords = defineStore('words', () => {
    const words: IWord[] = reactive(tryJSON(localStorage.getItem('words')) ?? [
        {
            disp: 'ニャディクト',
            sub: 'Nya Dict',
            desc: ''
        }
    ])

    const save = () => {
        localStorage.setItem('words', JSON.stringify(words))
    }

    const add = (word: IWord) => {
        if (words.some(i => i.disp === word.disp)) return false
        words.push(word)
        save()
    }

    const modify = (word: IWord) => {
        const oldIndex = words.findIndex(i => i.disp === word.disp)
        if (oldIndex >= 0) words[oldIndex] = word
        else words.push(word)
        save()
    }

    const merge = (words: IWord[]) => {
        words.forEach(word => modify(word))
    }

    return {
        words,
        save, add, modify, merge
    }
})
