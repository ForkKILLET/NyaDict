import { type Ref } from 'vue'
import { defineStore } from 'pinia' 
import { toHiragana, toRomaji, isHiragana} from 'wanakana'
import { randomItem } from '@util'
import { useArchives } from '@store/archive'
import type { IMemory, ITestRec, IWord } from '@type'
import { storeRef, type ArrayStore, storeArray } from '@/utils/storage'
import type { Disposable } from '@/utils/disposable'

export const baseInterval = 5

declare module '@type' {
    interface IArchiveData {
        words: Ref<ArrayStore<IWord>> & Disposable
        wordMaxId: Ref<number> & Disposable
    }
}

export const useWords = defineStore('words', () => {
    const archiveStore = useArchives()

    archiveStore.defineArchiveItem('wordMaxId', (key) => storeRef(key, 0))
    archiveStore.defineArchiveItem('words', (key) => storeArray(key, {
        onInit: (store) => {
            store.push({
                id: 0,
                disp: 'ニャディクト',
                sub: 'Nya Dict',
                desc: '',
                mem: emptyMem()
            })
            archiveStore.archiveInfo['0'] = {
                title: '黙認',
                accessTime: Date.now(),
                size: 0,
                wordCount: 1,
                version: '2'
            }
        },
        map: {
            serialize: ({
                id: I, disp: D, sub: S,
                mem: { easiness: E, testAfter: TT, correctCount: C, halfCorrectCount: H, wrongCount: W, createTime: TC, testRec: R }
            }) => JSON.stringify({
                I, D, S,
                M: { E, TT, C, H, W, TC, R: R.map(({ time: T, correct: C, mode: M, oldEasiness: E }) => ({ T, C, M, E })) }
            }),
            deserialize: (str) => {
                const { I, D, S, M: { E, TT, C, H, W, TC, R } } = JSON.parse(str)
                return {
                    id: I, disp: D, sub: S,
                    mem: {
                        easiness: E, testAfter: TT, correctCount: C, halfCorrectCount: H, wrongCount: W, createTime: TC,
                        // @ts-ignore
                        testRec: R.map(({ T, C, M, E }) => ({ time: T, correct: C, mode: M, oldEasiness: E }))
                    }
                }
            }
        }
    }))

    const { words, wordMaxId: maxId } = archiveStore.extractData([ 'words', 'wordMaxId' ])

    const add = (word: Omit<IWord, 'id'>) => {
        const id = ++ maxId.value
        words.value.push({ ...word, id })
        archiveStore.archiveInfo[archiveStore.currentId].wordCount! ++
        return id
    }

    const modify = (word: IWord) => {
        const oldIndex = words.value.findIndex(i => i.id === word.id)
        if (oldIndex >= 0) words.value.set(oldIndex, word)
        else words.value.push(word)
    }

    const withdraw = (id: number) => {
        const index = words.value.findIndex(word => word.id === id)
        if (index >= 0) words.value.swapRemove(index)
        archiveStore.archiveInfo[archiveStore.currentId].wordCount! --
    }

    const getById = (id: number | undefined): IWord | undefined => {
        if (id === undefined) return
        return words.value.find(word => word.id === id)
    }

    const pushTestRec = (word: IWord, rec: Omit<ITestRec, 'oldEasiness'>) => {
        word.mem.testRec.push({
            ...rec,
            oldEasiness: word.mem.easiness
        })
        if (rec.correct === 1) word.mem.correctCount ++
        else if (rec.correct === 0) word.mem.wrongCount ++
        else word.mem.halfCorrectCount ++

        // Note: SRS algorithm here
        const origEasiness = word.mem.easiness ?? 0
        word.mem.easiness = Math.max(Math.min(origEasiness + (rec.correct - 0.6) * 0.5, 3), 0)
        const interval = baseInterval * word.mem.easiness + 0.25
        word.mem.testAfter = Date.now() + interval * 24 * 3600 * 1000

        return word.mem.easiness
    }

    const popTestRec = (word: IWord): ITestRec | undefined => {
        const rec = word.mem.testRec.pop()
        return rec
    }

    const randomWord = () => randomItem(words.value)

    return {
        words,
        add, modify, withdraw,
        getById, pushTestRec, popTestRec, randomWord
    }
})

export const emptyMem = (): IMemory => ({
    easiness: 0,
    testAfter: 0,
    correctCount: 0,
    wrongCount: 0,
    halfCorrectCount: 0,
    createTime: Date.now(),
    testRec: []
})

export const getCorrectness = (mem: IMemory) => {
    const total = mem.correctCount + mem.wrongCount + mem.halfCorrectCount
    return total ? 1 - mem.wrongCount / total : 0
}

export const getRomaji = (word: IWord) => {
    if (word.sub.match(/[a-z]/)) return toRomaji(word.disp)
    return toRomaji(word.sub)
}

export const getYomikataIndex = (word: IWord) => (
    (isHiragana(word.sub[0])
        ? word.sub[0]
        : toHiragana(word.disp[0])
    ).charCodeAt(0)
)

export const getLastTestTime = (word: IWord) => word.mem.testRec.at(-1)?.time ?? 0
