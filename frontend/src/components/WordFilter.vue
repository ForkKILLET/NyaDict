<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { useDebounceFn, useRefHistory } from '@vueuse/core'

import { useWord } from '@store/words'

defineProps<{
    modelValue: string // Filter query string
}>()

const wordStore = useWord()
const { query } = toRefs(wordStore.filter)

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
</script>

<template>
    <div class="word-filter card input light">
        <input
            class="query-raw-str"
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
</template>

<style scoped>
.word-filter {
    display: flex;
    align-items: center;
    margin-bottom: .5em;
}

.query-raw-str {
    width: calc(100% - 1.6em);
    padding: .2em .5em;
    font-size: 1rem;
    font-family: var(--font-mono);
}
</style>
