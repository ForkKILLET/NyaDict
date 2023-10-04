<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { useDebounceFn, useRefHistory } from '@vueuse/core'

import { useWord } from '@store/words'

import { strictToHiragana } from '@util/kana'
import { type IQuery } from '@util/filterQuery'

import TestCorrectLevel from '@comp/TestCorrectLevel.vue'
import WordFilterUnit from './WordFilterUnit.vue'

defineProps<{
    modelValue: IQuery | undefined // Filter query
}>()

const wordStore = useWord()
const { query } = toRefs(wordStore.filter)

// const searchHistory = useRefHistory(search)
// const searchHiragana = computed(() => strictToHiragana(search.value))
// const searchDebounced = computed<string>({
//     get: () => search.value ?? '',
//     set: (newSearch) => {
//         setSearch(newSearch)
//     }
// })

// const setSearch = useDebounceFn((v: string) => {
//     search.value = v
// }, 300)
// const clearSearch = () => {
//     search.value = ''
// }
// const onSearchDelete = () => {

// }
</script>

<template>
    <div class="filter-search card input light">
        <!-- <WordFilterUnit @delete="testId = null">
            テスト <span class="id">{{ testId }}</span>
            <TestCorrectLevel v-model="testCorrectLevel" />
        </WordFilterUnit>

        <span v-if="testId" class="filter-test badge">
        </span>

        <input
            ref="searchEl"
            v-model="searchDebounced"
            @keydown.delete="onSearchDelete"
            @keydown.up="searchHistory.undo"
            @keydown.down="searchHistory.redo"
        />

        <fa-icon
            @click="clearSearch"
            icon="times-circle" class="button"
        /> -->
    </div>
</template>
