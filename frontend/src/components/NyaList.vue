<script setup lang="ts" generic="T">
import { computed } from 'vue'
import { useOffsetPagination } from '@vueuse/core'
import Pager from '@comp/Pager.vue'

const props = defineProps<{
    items: T[]
    activeWordId?: number
}>()

const total = computed(() => props.items.length)

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
    <div class="nyalist">
        <div class="nyalist-header">
            <div class="nyalist-count">
                <slot name="header" :count="items.length"></slot>
            </div>
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
        <div class="nyalist-entries">
            <p v-for="item of items.slice((page - 1) * pageSize, page * pageSize)">
                <slot name="default" :item="item"></slot>
            </p>
        </div>
    </div>
</template>

<style scoped>
.nyalist {
    display: flex;
    flex-flow: column;
    overflow: hidden;
    margin: 0 -1em;
    padding: 0 1em;
}
.nyalist-header {
    margin-bottom: .5em;
}
.nyalist-entries {
    flex: 1;
    margin: 0 -1em;
    padding: 0 1em;
    overflow-y: auto;
    scrollbar-width: none;
}
.nyalist-entries::-webkit-scrollbar {
    display: none;
}
.nyalist-count {
    margin-bottom: .5em;
}
</style>

