<script setup lang="ts">
import { computed, ref, toRefs, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useDebounceFn, useRefHistory } from '@vueuse/core'

import { useWord } from '@store/words'

import { compile, parse } from '@util/filterQuery'

import NyaCheckbox from '@comp/NyaCheckbox.vue'

const wordStore = useWord()
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

watch([ query, advanced ], () => {
    const result = queryParseResult.value = parse(query.value, advanced.value)
    switch (result.state) {
        case 'null':
            queryError.value = null
            queryFilter.value = null
            break
        case 'error':
            queryError.value = result.error
            queryFilter.value = null
            break
        case 'success':
            queryError.value = null
            queryFilter.value = compile(result.ast, query.value)
            break
    }
    
}, { immediate: true })
</script>

<template>
    <div class="word-filter">
        <div class="word-filter-settings">
            <NyaCheckbox v-model="advanced" :tiny="true">高級フィルタ</NyaCheckbox>
        </div>

        <div class="word-filter-query card input light">
            <input
                class="query-input"
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

        <pre class="query-error scroll-x" v-if="queryError">{{
            queryError.message
        }}</pre>
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

.query-input {
    width: calc(100% - 1.6em);
    padding: .2em .5em;
    font-size: 1rem;
    font-family: var(--font-mono);
}

.query-error {
    color: var(--color-wrong);
    font-family: var(--font-mono);
    font-size: .8em;
}
</style>
