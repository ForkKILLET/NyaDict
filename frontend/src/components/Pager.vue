<script setup lang="ts">
import { computed } from 'vue'
import { range } from '../utils'

const props = defineProps<{
    page: number
    pageCount: number
    displayPageCount: number
    prev: () => void
    next: () => void
    goto: (page: number) => void
    isFirstPage: boolean
    isLastPage: boolean
}>()

const pages = computed(() => {
    const i = props.page
    const len = props.displayPageCount - 1
    const half = len / 2 | 0
    let startPage = i - half
    let endPage = i + len - half
    if (startPage <= 0) {
        endPage = Math.min(props.pageCount, 1 + len)
        startPage = 1
    }
    else if (endPage > props.pageCount) {
        startPage = Math.max(0, props.pageCount - len)
        endPage = props.pageCount
    }
    return range(startPage, endPage + 1)
})
</script>

<template>
    <div class="pager">
        <div @click="prev" class="page-button" :class="{ disabled: isFirstPage }">
            <fa-icon icon="arrow-left" />
        </div>
        <div class="page-ids">
            <div
                v-for="id of pages"
                @click="goto(id)"
                class="page-button"
                :class="{ active: id === page }"
            >{{ id }}</div>
        </div>
        <div @click="next" class="page-button" :class="{ disabled: isLastPage }">
            <fa-icon icon="arrow-right" />
        </div>
    </div>
</template>

<style scoped>
.pager {
    display: flex;
    justify-content: space-between;
}
.page-button {
    display: inline-block;
    width: 1.5em;
    margin: 0 .2em;
    padding: .2em;
    border-radius: .3em;
    text-align: center;
    background-color: #fffaf6;
    color: #db8e30;
    user-select: none;
    cursor: pointer;
    transition: .3s color, .3s background-color;
}
.page-ids {
    white-space: nowrap;
}
.page-button:first-child {
    margin-left: 0;
}
.page-button:last-child {
    margin-right: 0;
}
.page-button.active {
    color: #fff;
    background-color: #db8e30;
}
.page-button:not(.disabled):hover {
    color: #f7b96e;
    background-color: #db8e30;
}
.page-button.disabled {
    color: #aaa;
}
</style>
