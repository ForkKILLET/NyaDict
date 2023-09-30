import { defineStore } from 'pinia' 
import { computed, ref, type Ref } from 'vue'

import { useArchive } from '@store/archive'

import { groupBy, sample, shuffle } from '@util'
import { storeArray, type ArrayStore, storeRef } from '@util/storage'
import type { Disposable } from '@util/disposable'
import { type ITest_Compress, compress_ITest } from '@util/compress'

import type { ITest, TestMode, IWord } from '@type'

declare module '@type' {
    interface IArchiveData {
        tests: Ref<ArrayStore<ITest>> & Disposable
        ongoingTestId: Ref<number | undefined> & Disposable
        testMaxId: Ref<number> & Disposable
    }
}

export const useTest = defineStore('test', () => {
    const archiveStore = useArchive()
    archiveStore.define('tests', key => storeArray<ITest, ITest_Compress>(key, {
        map: compress_ITest
    }))
    archiveStore.define('ongoingTestId', key => storeRef(key, undefined))
    archiveStore.define('testMaxId', key => storeRef(key, 0))
    const { tests, ongoingTestId, testMaxId: maxId } = archiveStore.extractData([ 'tests', 'ongoingTestId', 'testMaxId' ])
    
    const ongoingTest = computed(() => {
        return getById(ongoingTestId.value)
    })

    const lasrTestId = ref<number>()

    const create = (testableWords: IWord[], {
        mode, size, preferUntested
    }: {
        mode: TestMode
        size: number
        preferUntested?: boolean
    }) => {
        const wordIds: number[] = []

        if (preferUntested) {
            const { true: untestedWordIds = [], false: testedWordIds = [] } = groupBy(
                testableWords,
                word => String(! word.mem.testAfter) as 'true' | 'false',
                word => word.id
            )
            if (untestedWordIds.length <= size) {
                wordIds.push(
                    ...untestedWordIds,
                    ...sample(testedWordIds, size - untestedWordIds.length)
                )
            }
            else {
                wordIds.push(...sample(untestedWordIds, size))
            }
        }
        else {
            const testableWordIds = testableWords.map(word => word.id)
            wordIds.push(...sample(testableWordIds, size))
        }

        shuffle(wordIds)

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
