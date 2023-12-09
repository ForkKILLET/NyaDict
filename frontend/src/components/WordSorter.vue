<script setup lang="ts">
import { toRefs,  watch } from 'vue'
import { storeToRefs } from 'pinia'

import { getCorrectness, getYomikataIndex, getLastTestTime, useWord } from '@store/words'

import type { IWord, IWordSortMethod } from '@type'

const wordStore = useWord()
const { sorter, sorterFn } = storeToRefs(wordStore)
const { method: sortMethod, direction: sortDirection } = toRefs(sorter.value)
const sortMethodInfo = {
    id: 'ID',
    createTime: '作成時間',
    acc: '正確率',
    correctCount: 'パス数',
    wrongCount: 'ミス数',
    halfCorrectCount: 'あやふや数',
    yomikata: '読み方',
    testTime: 'テスト時間',
    easiness: 'EZ'
}

watch(sorter, () => {
    const { value: method } = sortMethod
    sorterFn.value = (a: IWord, b: IWord) => {
        const delta =
            method === 'id' ? b.id - a.id :
            method === 'createTime' ? a.mem.createTime - b.mem.createTime :
            method === 'acc' ? getCorrectness(a.mem) - getCorrectness(b.mem) :
            method === 'correctCount' ? a.mem.correctCount - b.mem.correctCount :
            method === 'wrongCount' ? a.mem.wrongCount - b.mem.wrongCount :
            method === 'halfCorrectCount' ? a.mem.halfCorrectCount - b.mem.halfCorrectCount :
            method === 'yomikata' ? getYomikataIndex(b) - getYomikataIndex(a) :
            method === 'testTime' ? getLastTestTime(a) - getLastTestTime(b) :
            method === 'easiness' ? a.mem.easiness - b.mem.easiness :
            0
        return sortDirection.value === 'up' ? - delta : + delta
    }
}, { immediate: true })

const onSortMethodClick = (method: IWordSortMethod) => {
    if (method === sortMethod.value) {
        sortDirection.value = sortDirection.value === 'up' ? 'down' : 'up'
    }
    else {
        sortMethod.value = method
    }
}
</script>

<template>
    <div class="word-sorter">
        <span
            v-for="methodInfo, method in sortMethodInfo"
            :key="method"
            class="badge"
            @click="onSortMethodClick(method)"
        >
            {{ methodInfo }}
            <fa-icon
                class="button"
                :icon="method === sortMethod ? 'sort-' + sortDirection : 'sort'"
            />
        </span>
    </div>
</template>

<style scoped>
.word-sorter {
    display: flex;
    flex-wrap: wrap;
}
</style>
