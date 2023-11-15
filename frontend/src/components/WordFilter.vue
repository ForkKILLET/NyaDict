<script setup lang="ts">
import { computed, ref, toRefs } from 'vue'
import { storeToRefs } from 'pinia'
import { useDebounceFn, useRefHistory } from '@vueuse/core'

import { useWord } from '@store/words'
import { useTest } from '@store/test'

import { useNyatalk } from '@util/nyatalk/reactivity'
import type { INtCalcCtx_WordFilter } from '@util/nyatalk'

import type { IWord } from '@type'

import NtParseError from '@util/nyatalk/components/NtParseError.vue'
import NyaCheckbox from '@comp/NyaCheckbox.vue'

const wordStore = useWord()
const testStore = useTest()
const { queryError, queryParseResult, queryFilter } = storeToRefs(wordStore)
const { query, advanced } = toRefs(wordStore.filter)

const setQuery = useDebounceFn((val: string) => {
    query.value = val
}, 300)
const clearQuery = () => {
    query.value = ''
}
const queryDebounced =  computed<string>({
    get: () => query.value ?? '',
    set: setQuery
})
const queryHistory = useRefHistory(query)

useNyatalk<INtCalcCtx_WordFilter, IWord, boolean>({
    code: query,
    advanced,
    isBoolean: true,
    getCalcCtx: ref((word) => ({
        currentWord: word,
        tests: testStore.tests
    }))
}, {
    ntParseResult: queryParseResult,
    ntError: queryError,
    ntFunction: queryFilter
})
</script>

<template>
    <div class="word-filter">
        <div class="word-filter-settings">
            <NyaCheckbox v-model="advanced" :tiny="true">高級フィルタ</NyaCheckbox>
        </div>

        <div class="word-filter-query card input light">
            <input
                class="nt-input"
                ref="queryEl"
                v-model="queryDebounced"
                @keydown.up="queryHistory.undo"
                @keydown.down="queryHistory.redo"
            />

            <fa-icon
                @click="clearQuery"
                icon="times-circle" class="button"
            />
        </div>

        <NtParseError v-if="queryError" :error="queryError"></NtParseError>
    </div>
</template>

<style scoped>
.word-filter-settings {
    margin-bottom: .5em;
}

.word-filter-query {
    display: flex;
    align-items: center;
    margin-bottom: .5em;
}

.nt-input {
    width: calc(100% - 1.6em);
    padding: .2em .5em;
    font-size: 1rem;
    font-family: var(--font-mono);
}

</style>
