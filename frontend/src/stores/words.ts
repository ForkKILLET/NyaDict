import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia' 
import { toHiragana, toRomaji, isHiragana} from 'wanakana'
import { useArchive } from '@store/archive'

import { randomItem } from '@util'
import { IWord_Compress, compress_IWord } from '@util/compress'
import { storeRef, storeArray, storeRefReactive, type ArrayStore } from '@util/storage'
import type { Disposable } from '@util/disposable'

import type {
    IMemory, ITestRec, IWord, ICorrect,
    IWordDocumentWithoutId, IWordGraph, IWordDocument, IWordGraphEdge
} from '@type'
import { DocumentKind } from '@type'

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

    archiveStore.define('wordMaxId', (key) => storeRef(key, 0))
    archiveStore.define('words', (key) => storeArray<IWord, IWord_Compress>(key, {
        onInit: (store) => {
            store.push({
                id: 0,
                disp: 'ニャディクト',
                sub: 'Nya Dict',
                mem: emptyMem()
            })
        },
        map: compress_IWord
    }))
    archiveStore.define('wordFilter', (key) => storeRefReactive(key, {
        search: null,
        testId: null,
        testCorrectLevel: 1
    }))
    archiveStore.define('docMaxId', key => storeRef(key, 0))
    const { words, wordMaxId, wordFilter: filter, docMaxId } = archiveStore.extractData([ 'words', 'wordMaxId', 'wordFilter', 'docMaxId' ])
    
    const getWordDict = () => {
        const dict: Record<string, IWord> = {}
        words.value.forEach(word => {
            dict[word.id] = word
        })
        return dict
    }

    const add = (word: Omit<IWord, 'id'>) => {
        const id = ++ wordMaxId.value
        words.value.push({ ...word, id })
        archiveStore.currentInfo.wordCount! ++
        return id
    }

    const restore = (word: IWord) => {
        words.value.push(word)
        archiveStore.currentInfo.wordCount! ++

        if (word.docs) updateGraphByWord(word, word.docs, false)
    }

    const withdraw = (id: number) => {
        const index = words.value.findIndex(word => word.id === id)
        const word = words.value[index]
        if (index >= 0) words.value.swapRemove(index)

        if (word.docs) updateGraphByWord(word, word.docs, true)

        archiveStore.currentInfo.wordCount! --
    }

    const getById = (id: number | undefined): IWord | undefined => {
        if (id === undefined) return
        return words.value.find(word => word.id === id)
    }

    const pushTestRec = (word: IWord, rec: Omit<ITestRec, 'oldEasiness'>) => {
        const { testRec } = word.mem
        const repetitions = testRec.length

        testRec.push({
            ...rec,
            oldEasiness: word.mem.easiness
        })
        if (rec.correct === 1) word.mem.correctCount ++
        else if (rec.correct === 0) word.mem.wrongCount ++
        else word.mem.halfCorrectCount ++

        // SRS algorithm here
        const origEasiness = word.mem.easiness ?? 0
        word.mem.easiness = Math.max(Math.min(origEasiness + (rec.correct - 0.8) * 0.5, 3), 0)
        const interval = rec.correct
            ? repetitions
                ? baseInterval * (1.3 + word.mem.easiness)
                : 1
            : 1
        word.mem.testAfter = Date.now() + interval * 24 * 3600 * 1000

        return {
            recId: repetitions,
            newEasiness: word.mem.easiness
        }
    }

    const newlyAddedDocId = ref<number>()

    const addDoc = (docs: IWordDocument[], newDoc: IWordDocumentWithoutId) => {
        const id = ++ docMaxId.value 
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

    const updateGraphByTemplate = (
        docId: number,
        template: string,
        word: IWord,
        wordId: number,
        reversed: boolean,
        wordDict?: Record<string, IWord>,
    ) => {
        const segments = getTemplateSegements(template)
        segments.forEach(seg => {
            if (typeof seg === 'object') {
                const nowId = seg.id
                if (! nowId) return

                word.graph ??= emptyGraph()

                const target = wordDict?.[nowId] ?? getById(nowId)
                if (target) {
                    target.graph ??= emptyGraph()
                    const { edgesIn } = target.graph
                    const nowEdge = newEdge(docId, wordId)
                    const indexIn = edgesIn.findIndex(edge => isSameEdge(edge, nowEdge))
                    if (indexIn >= 0 && reversed) edgesIn.splice(indexIn, 1)
                    else if (indexIn < 0 && ! reversed) edgesIn.push(nowEdge)
                }

                {
                    const { edgesOut } = word.graph
                    const nowEdge = newEdge(docId, nowId)
                    const indexOut = edgesOut.findIndex(edge => isSameEdge(edge, nowEdge))
                    if (indexOut >= 0 && reversed) edgesOut.splice(indexOut, 1)
                    else if (indexOut < 0 && ! reversed) edgesOut.push(nowEdge)
                }
            }
        })
    }

    const updateGraphByWord = (
        word: IWord,
        docs: IWordDocument[],
        reversed: boolean,
        wordDict?: Record<string, IWord>
    ) => {
        const wordId = word.id

        docs.forEach(doc => {
            if (doc.kind === DocumentKind.Link || doc.kind === DocumentKind.Sentence) {
                updateGraphByTemplate(doc.id, doc.text, word, wordId, reversed, wordDict)
            }
            if ('docs' in doc) updateGraphByWord(word, doc.docs, reversed, wordDict)
        })
    }

    const updateGraphs = () => {
        const wordDict = getWordDict()

        for (const id in wordDict) {
            const word = wordDict[id]
            delete word.graph
            if (word.docs) {
                updateGraphByWord(word, word.docs, false, wordDict)
            }
        }
    }

    const randomWord = () => randomItem(words.value)

    return {
        words, filter, getWordDict,
        add, withdraw, restore,
        newlyAddedDocId, addDoc,
        updateGraphs, updateGraphByTemplate,
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

export const getHiragana = (word: IWord) => toHiragana(getRomaji(word))

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

export type TemplateSegment = WordSegment | TextSegment
export type TextSegment = string
export type WordSegment = { id: number | undefined, disp: string | undefined }

export const getTemplateSegements = (template: string): TemplateSegment[] => template
    .split(/(#\d*\([^)]+?\)|#\d*)/)
    .map(seg => {
        if (seg[0] === '#') {
            const { id, disp } = seg
                .match(/#(?<id>\d+)?(\((?<disp>[^)]+?)\))?/)!.groups as { id?: string, disp?: string }
            return { id: id ? + id : undefined, disp }
        }
        return seg
    })
    .filter(seg => seg)

export const getFirstWordTemplateSegment = (template: string) => getTemplateSegements(template)
    .find((seg): seg is WordSegment => typeof seg === 'object')

export const emptyGraph = (): IWordGraph => ({ edgesIn: [], edgesOut: [] })

export const isSameEdge = (e1: IWordGraphEdge, e2: IWordGraphEdge) => (
    e1.sourceDoc === e2.sourceDoc && e1.targetWord === e2.targetWord
)

export const isSameTargetEdge = (a: IWordGraphEdge, b: IWordGraphEdge) => a.targetWord === b.targetWord

export const newEdge = (sourceDoc: number, targetWord: number): IWordGraphEdge => ({
    sourceDoc, targetWord
})
