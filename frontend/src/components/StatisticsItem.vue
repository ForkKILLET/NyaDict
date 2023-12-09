<script setup lang="ts" generic="T">
import { Ref, ref } from 'vue'

const props = defineProps<{
    title: string
    data: () => T
}>()

const value = ref(props.data()) as Ref<T>

const actionsEl = ref<HTMLSpanElement>()
</script>

<template>
    <div class="statistics-item card">
        <div class="statistics-item-title">
            <span>{{ title }}</span>
            <span class="statistics-item-actions">
                <span ref="actionsEl" />
                <fa-icon
                    icon="rotate"
                    class="button"
                    @click="value = data()"
                />
            </span>
        </div>
        <slot
            :data="value"
            :actions-el="actionsEl"
        />
    </div>
</template>

<style scoped>
.statistics-item-title {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: .5em;
}
</style>
