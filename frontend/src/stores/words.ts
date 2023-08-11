import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia' 
import { toHiragana, toRomaji, isHiragana} from 'wanakana'
import { randomItem } from '@util'
import { useArchive } from '@store/archive'
import { IWord_Compress, compress_IWord } from '@/utils/compress'
import { storeRef, type ArrayStore, storeArray, storeRefReactive } from '@/utils/storage'
import type { Disposable } from '@/utils/disposable'
import type { IMemory, ITestRec, IWord, ICorrect, IWordDocumentWithoutId } from '@type'
import { IWordDocument } from '@type'

export const baseInterval = 5

declare module '@type' {
    interface IArchiveData {
        words: Ref<ArrayStore<IWord>> & Disposable
        wordMaxId: Ref<number> & Disposable
        wordFilter: Ref<IWordFilter> & Disposable
        docMaxId: Ref<number> & Disposable
    }
}

export const useWord = defineStore('words', () => {
    const archiveStore = useArchive()
    archiveStore.defineArchiveItem('wordMaxId', (key) => storeRef(key, 0))
    archiveStore.defineArchiveItem('words', (key) => storeArray<IWord, IWord_Compress>(key, {
        onInit: (store) => {
            store.push({
                id: 0,
                disp: 'ニャディクト',
                sub: 'Nya Dict',
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
        map: compress_IWord
    }))
    archiveStore.defineArchiveItem('wordFilter', (key) => storeRefReactive(key, {
        search: null,
        testId: null,
        testCorrectLevel: 1
    }))
    archiveStore.defineArchiveItem('docMaxId', key => storeRef(key, 0))
    const { words, wordMaxId, wordFilter: filter, docMaxId } = archiveStore.extractData([ 'words', 'wordMaxId', 'wordFilter', 'docMaxId' ])

    const add = (word: Omit<IWord, 'id'>) => {
        const id = ++ wordMaxId.value
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

        return {
            recId: word.mem.testRec.length - 1,
            newEasiness: word.mem.easiness
        }
    }

    const newlyAddedDocId = ref<number>()

    const addDoc = (docs: IWordDocument[], newDoc: IWordDocumentWithoutId) => {
        const id = ++ docMaxId.value 
        newlyAddedDocId.value = id
        docs.push({
            ...newDoc,
            id
        })
        return id
    }

    const popTestRec = (word: IWord): ITestRec | undefined => {
        const rec = word.mem.testRec.pop()
        return rec
    }

    const randomWord = () => randomItem(words.value)

    return {
        words, filter,
        add, modify, withdraw,
        newlyAddedDocId, addDoc,
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

export const getCorrectnessCount = (correctness: ICorrect[]) => {
    let correct = 0
    let halfCorrect = 0
    let wrong = 0
    for (const c of correctness) {
        if (c === 1) correct ++
        else if (c === 0) wrong ++
        else halfCorrect ++
    }
    return {
        correct, halfCorrect, wrong,
        acc: correct / correctness.length
    }
}
