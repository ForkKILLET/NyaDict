import { defineStore } from 'pinia' 
import { ref, watch } from 'vue'
import { toHiragana, toRomaji, isHiragana} from 'wanakana'
import { randomItem } from '@util'
import { getStorage, setStorage, storageRef, storageReactive } from '@util/storage'
import type { IArchiveInfo, IMemory, ITestRec, IWord } from '@type'

export const baseInterval = 5

export const useWords = defineStore('words', () => {
    const archiveId = storageRef('archiveId', '0')
    const archiveInfo = storageReactive<Record<string, IArchiveInfo>>('archiveInfo', {})
    const words = ref<IWord[]>([])

    watch(archiveId, newId => {
        words.value = getStorage('words:' + newId) ?? []
    })

    const maxId = ref(0)
    const updateMaxId = () => {
        maxId.value = words.value.length ? Math.max(...words.value.map(word => word.id)) : -1
    }
    updateMaxId()

    const save = () => {
        const id = archiveId.value
        setStorage('words:' + id, words.value)
        archiveInfo[id].accessTime = Date.now()
        archiveInfo[id].wordCount = words.value.length
    }

    const load = () => {
        const wordsActive = getStorage<IWord[]>('words:' + archiveId.value)
        if (wordsActive) {
            words.value = wordsActive
            updateMaxId()
        }
        else {
            archiveInfo[archiveId.value] = {
                title: '黙認',
                accessTime: Date.now(),
                size: 0,
                wordCount: 1
            }
            words.value = [
                {
                    id: 0,
                    disp: 'ニャディクト',
                    sub: 'Nya Dict',
                    desc: '',
                    mem: emptyMem()
                }
            ]
        }
    }
    watch(archiveId, load, { immediate: true })

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

    const withdraw = (id: number) => {
        const index = words.value.findIndex(word => word.id === id)
        if (index >= 0) words.value.splice(index, 1)
        updateMaxId()
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
        if (rec.correct === 1) word.mem.correctCount ++
        else if (rec.correct === 0) word.mem.wrongCount ++
        else word.mem.halfCorrectCount ++

        // Note: SRS algorithm here
        word.mem.easiness = Math.max(Math.min((word.mem.easiness ?? 0) + (rec.correct - 0.6) * 0.5, 3), 0)
        const interval = baseInterval * word.mem.easiness + 0.25
        word.mem.testAfter = Date.now() + interval * 24 * 3600 * 1000 

        save()
        return true
    }

    const randomWord = () => randomItem(words.value)

    return {
        words, archiveId, archiveInfo,
        updateMaxId, save, load,
        add, modify, withdraw, merge,
        getById, addTestRec, randomWord
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
