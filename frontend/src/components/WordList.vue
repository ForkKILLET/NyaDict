<script setup lang="ts">
import { computed } from 'vue'
import { useOffsetPagination } from '@vueuse/core'
import WordListEntry from '@comp/WordListEntry.vue'
import Pager from '@comp/Pager.vue'
import type { IWord } from '@type'

const props = defineProps<{
    words: IWord[]
    activeWordId?: number
}>()

const emit = defineEmits<{
    (event: 'goto-word', word: IWord): void
}>()

const total = computed(() => props.words.length)

const {
    currentPage: page,
    currentPageSize: pageSize,
    pageCount,
    prev,
    next,
    isFirstPage,
    isLastPage
} = useOffsetPagination({
    total,
    page: 1,
    pageSize: 20
})
</script>

<template>
    <div class="word-list">
        <div class="word-list-header">
            <div class="word-count"><span class="number">{{ words.length }}</span> 単語</div>
            <Pager
                :page="page"
                :page-count="pageCount"
                :display-page-count="6"
                :prev="prev"
                :next="next"
                :goto="(id: number) => page = id"
                :is-first-page="isFirstPage"
                :is-last-page="isLastPage"
            />
        </div>
        <div class="word-list-entries">
            <p v-for="word of words.slice((page - 1) * pageSize, page * pageSize)">
                <WordListEntry
                    :key="word.id"
                    :word="word"
                    :active="activeWordId === word.id"
                    @goto-word="(word: IWord) => emit('goto-word', word)"
                />
            </p>
        </div>
    </div>
</template>

<style scoped>
.word-list {
    display: flex;
    flex-flow: column;
    overflow: hidden;
    margin: 0 -1em;
    padding: 0 1em;
}
.word-list-header {
    margin-bottom: .5em;
}
.word-list-entries {
    flex: 1;
    margin: 0 -1em;
    padding: 0 1em;
    overflow-y: auto;
    scrollbar-width: none;
}
.word-list-entries::-webkit-scrollbar {
    display: none;
}
.word-count {
    margin-bottom: .5em;
}
</style>
