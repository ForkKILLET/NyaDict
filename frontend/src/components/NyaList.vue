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
    <div class="nya-list">
        <div class="nya-list-header">
            <div class="nya-list-count">
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
        <div class="nya-list-entries">
            <p v-for="item of items.slice((page - 1) * pageSize, page * pageSize)">
                <slot name="default" :item="item"></slot>
            </p>
        </div>
    </div>
</template>

<style scoped>
.nya-list {
    display: flex;
    flex-flow: column;
    overflow: hidden;
    margin: 0 -1em;
    padding: 0 1em;
}
.nya-list-header {
    margin-bottom: .5em;
}
.nya-list-entries {
    flex: 1;
    margin: 0 -1em;
    padding: 0 1em;
    overflow-y: auto;
    scrollbar-width: none;
}
.nya-list-entries::-webkit-scrollbar {
    display: none;
}
.nya-list-count {
    margin-bottom: .5em;
}
</style>

