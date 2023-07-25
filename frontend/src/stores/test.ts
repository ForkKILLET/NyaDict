import { defineStore } from 'pinia' 
import { computed, ref, type Ref } from 'vue'
import { useArchive } from '@store/archive'
import { storeArray, type ArrayStore, storeRef } from '@util/storage'
import { sample } from '@util'
import type { ITest, ITestMode, IWord } from '@type'
import type { Disposable } from '@/utils/disposable'

declare module '@type' {
    interface IArchiveData {
        tests: Ref<ArrayStore<ITest>> & Disposable
        ongoingTestId: Ref<number | undefined> & Disposable
        testMaxId: Ref<number> & Disposable
    }
}

export const useTest = defineStore('test', () => {
    const archiveStore = useArchive()
    archiveStore.defineArchiveItem('tests', (key) => storeArray(key))
    archiveStore.defineArchiveItem('ongoingTestId', (key) => storeRef(key, undefined))
    archiveStore.defineArchiveItem('testMaxId', (key) => storeRef(key, 0))
    const { tests, ongoingTestId, testMaxId: maxId } = archiveStore.extractData([ 'tests', 'ongoingTestId', 'testMaxId' ])
    
    const ongoingTest = computed(() => {
        return getById(ongoingTestId.value)
    })

    const lasrTestId = ref<number>()

    const create = (testableWords: IWord[], mode: ITestMode, size = 20) => {
        const testableWordIds = testableWords.map((word: IWord) => word.id)
        const wordIds = sample(testableWordIds, size)

        const test: ITest = {
            id: ++ maxId.value,
            createTime: Date.now(),
            accessTime: Date.now(),
            mode,
            wordIds,
            maxIndex: 0,
            currentIndex: 0,
            correctness: [],
            recIds: [],
            locked: false
        }

        tests.value.push(test)
        return test
    }

    const getById = (id: number | undefined): ITest | undefined => {
        if (id === undefined) return
        return tests.value.find(test => test.id === id)
    }

    return {
        tests, ongoingTest, ongoingTestId, lastTestId: lasrTestId,
        create, getById
    }
})

export type RelativeTestTime = '未テスト' | '今' | '一日後' | '二日後' | '三日後'

export const getRelativeTestTime = (time: number, now: number): RelativeTestTime => {
    if (! time) return '未テスト'
    const delta = time - now
    if (delta <= 0) return '今'
    if (delta < 24 * 3600_000) return '一日後'
    if (delta < 2 * 24 * 3600_000) return '二日後'
    return '三日後'
}

export const relativeTestTimeColors: Record<RelativeTestTime, string> = {
    '未テスト': '#eee',
    '今': '#39d353',
    '一日後': '#61dc75',
    '二日後': '#88e598',
    '三日後': '#b0edba'
}
