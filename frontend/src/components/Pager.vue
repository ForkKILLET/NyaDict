<script setup lang="ts">
import { computed } from 'vue'
import { range } from '@util'

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
        startPage = Math.max(1, props.pageCount - len)
        endPage = props.pageCount
    }
    return range(startPage, endPage + 1)
})
</script>

<template>
    <div class="pager">
        <div
            class="page-button"
            :class="{ disabled: isFirstPage }"
            @click="prev"
        >
            <fa-icon icon="arrow-left" />
        </div>
        <div class="page-ids">
            <div
                v-for="id of pages"
                class="page-button"
                :class="{ active: id === page }"
                @click="goto(id)"
            >
                {{ id }}
            </div>
        </div>
        <div
            class="page-button"
            :class="{ disabled: isLastPage }"
            @click="next"
        >
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
    background-color: var(--color-ui-bg);
    color: var(--color-ui);
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
    color: var(--color-bg);
    background-color: var(--color-ui);
}
.page-button:not(.disabled):hover {
    color: var(--color-ui-act);
    background-color: var(--color-ui);
}
.page-button.disabled {
    color: #aaa;
}
</style>
