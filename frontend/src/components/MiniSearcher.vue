<script lang="ts">
import type { UnwrapRef } from 'vue'

export type MiniList<T> = Array<{
    display: string
    value: T
}>

</script>

<script setup lang="ts" generic="T">
import { ref, watch } from 'vue'
import { vOnClickOutside } from '@vueuse/components'

const props = defineProps<{
    getList: (search: string) => UnwrapRef<MiniList<T>>
}>()

const emit = defineEmits<{
    (event: 'select', word: UnwrapRef<T>): void
    (event: 'cancel', value?: string): void
}>()

const search = ref('')

const list = ref<MiniList<T>>([])

watch(search, newSearch => {
    list.value = props.getList(newSearch)
}, { immediate: true })

const cancel = (preserve = false) => {
    emit('cancel', preserve ? search.value : undefined)
    search.value = ''
}

const submit = (item: UnwrapRef<T>) => {
    emit('select', item)
    search.value = ''
}

const inputEl = ref<HTMLInputElement>()
const focus = () => {
    inputEl.value?.focus()
}

const activeIndex = ref(0)
const moveActiveItem = (delta: number) => {
    const { length } = list.value
    if (! length) return
    activeIndex.value = (activeIndex.value + delta + length) % length
}
const submitActiveItem = () => {
    const activeItem = list.value[activeIndex.value]
    if (activeItem) submit(activeItem.value)
    else cancel(true)
}

defineExpose({
    focus
})
</script>

<template>
    <div
        v-on-click-outside="() => cancel()"
        class="word-mini-searcher card deep"
    >
        <input
            v-model="search"
            ref="inputEl"
            @keydown.esc.prevent.stop="cancel()"
            @keydown.enter.prevent="submitActiveItem"
            @keydown.down="moveActiveItem(+ 1)"
            @keydown.up="moveActiveItem(- 1)"
            @keydown.tab.exact.prevent="moveActiveItem(+ 1)"
            @keydown.tab.shift.prevent="moveActiveItem(- 1)"
            @change="activeIndex = 0"
            class="card light"
        />
        <div class="word-mini-list" v-for="item, index of list">
            <div
                @click="submit(item.value)"
                class="word-mini-item"
                :class="{ active: index === activeIndex }"
            >{{ item.display }}</div>
        </div>
    </div>
</template>

<style scoped>
.word-mini-searcher {
    font-size: .8em;
    padding: .5em;
}

input.card.light {
    width: 100%;
    padding: 0 .5em;
}

.word-mini-list:not(:empty) {
    margin-top: .5em;
}

.word-mini-item {
    margin: .2em;
    padding: 0 .3em;
    border-radius: .5em;
    line-height: 1.5;
    color: var(--color-ui);
    transition: .3s background-color;
}

.word-mini-item:hover, .word-mini-item.active {
    background-color: var(--color-ui-bg);
}
</style>
