<script setup lang="ts" generic="T">
import { Ref, ref } from 'vue'

const props = defineProps<{
    title: string
    data: () => T
}>()

const value = ref(props.data()) as Ref<T>
</script>

<template>
    <div class="statistics-item card">
        <div class="statistics-item-title">
            <span>{{ title }}</span>
            <fa-icon @click="value = data()" icon="rotate" class="button" />
        </div>
        <slot :data="value"></slot>
    </div>
</template>

<style scoped>
.statistics-item-title {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
}
</style>
