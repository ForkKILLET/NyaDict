<script setup lang="ts" generic="T">
import { computed, ref } from 'vue'
import { useOffsetPagination } from '@vueuse/core'
import Pager from '@comp/Pager.vue'

const props = defineProps<{
    items: T[]
    activeWordId?: number
}>()

const total = computed(() => props.items.length)

const pagination = useOffsetPagination({
    total,
    page: 1,
    pageSize: 20
})

const {
    currentPage: page,
    currentPageSize: pageSize,
    pageCount,
    prev,
    next,
    isFirstPage,
    isLastPage
} = pagination

const scrollEl = ref<HTMLDivElement>()

const currentSlice = computed(() => (
    props.items.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
))

defineExpose({
    currentSlice,
    pagination,
    scrollEl
})
</script>

<template>
    <div class="nya-list">
        <div class="nya-list-header">
            <div class="nya-list-count">
                <slot
                    name="header"
                    :count="items.length"
                />
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
        <div
            ref="scrollEl"
            class="nya-list-entries scroll-y"
        >
            <p v-for="item of currentSlice">
                <slot
                    name="default"
                    :item="item"
                />
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
}
.nya-list-count {
    margin-bottom: .5em;
}
</style>

