import { defineStore } from 'pinia' 
import { ref, watch } from 'vue'
import { toHiragana, toRomaji, isHiragana} from 'wanakana'
import { randomItem } from '@util'
import { storeRef, storeReactive, storeArray, type ArrayStore } from '@util/storage'
import type { IArchiveInfo, IMemory, ITestRec, IWord } from '@type'

export const baseInterval = 5

export const useWords = defineStore('words', () => {
    const archiveId = storeRef('archiveId', '0')
    const archiveInfo = storeReactive<Record<string, IArchiveInfo>>('archiveInfo', {})
    const words = ref(undefined as unknown as ArrayStore<IWord>)

    const maxId = ref(0)
    const updateMaxId = () => {
        maxId.value = words.value.length ? Math.max(...words.value.map(word => word.id)) : -1
    }

    Object.assign(window, {words})

    watch(archiveId, newId => {
        words.value = storeArray('words:' + newId, {
            onInit: words => {
                words.push({
                    id: 0,
                    disp: 'ニャディクト',
                    sub: 'Nya Dict',
                    desc: '',
                    mem: emptyMem()
                })
                archiveInfo[archiveId.value] = {
                    title: '黙認',
                    accessTime: Date.now(),
                    size: 0,
                    wordCount: 1
                }
            }
        })
        updateMaxId()
    }, { immediate: true })

    const add = (word: Omit<IWord, 'id'>) => {
        const id = ++ maxId.value
        words.value.push({ ...word, id })
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
        updateMaxId()
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
        words, archiveId, archiveInfo,
        updateMaxId,
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
