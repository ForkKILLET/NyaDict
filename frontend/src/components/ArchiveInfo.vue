<script setup lang="ts">
import { ref } from 'vue'
import type { IArchiveInfo } from '../types'
import Card from './Card.vue'
import NyaDate from './Date.vue'

const props = defineProps<{
    info: IArchiveInfo
    id?: string
    active?: boolean
}>()

const editMode = ref(false)
const newTitle = ref('')
const startEditing = () => {
    newTitle.value = props.info.title
    editMode.value = true
}
const endEditing = () => {
    props.info.title = newTitle.value
    editMode.value = false
}
</script>

<template>
    <Card class="archive-info" :class="{ barber: active }">
        <div class="archive-info-content">
            <div class="archive-info-header">
                <span v-if="id !== undefined" class="id">{{ id }}</span>
                <div class="archive-info-title-container">
                    <template v-if="! editMode">
                        <span class="archive-info-title">{{ info.title }}</span>
                        <fa-icon @click="startEditing" icon="edit" class="button"></fa-icon>
                    </template>
                    <template v-else>
                        <input
                            type="text"
                            autofocus="true"
                            v-model="newTitle"
                            class="archive-info-title"
                        />
                        <fa-icon @click="endEditing" icon="circle-check" class="button"></fa-icon>
                    </template>
                </div>
            </div>
            <div>
                <fa-icon icon="fa-solid fa-calendar" :fixed-width="true" />
                <NyaDate :date="info.accessTime" :long="true" />
            </div>
            <div>
                <fa-icon icon="fa-solid fa-folder" :fixed-width="true" />
                <span><span class="number">{{ info.wordCount ?? 'N/A' }}</span> 単語</span>
            </div>
            <div>
                <fa-icon icon="fa-solid fa-box" :fixed-width="true" />
                <span><span class="number">{{ (info.size / 1024).toFixed(2) }}</span> KiB</span>
            </div>
        </div>
        <div class="archive-info-action">
            <slot></slot>
        </div>
    </Card>
</template>

<style scoped>
.archive-info {
    display: flex;
    justify-content: space-between;
}

.archive-info-content {
    flex: 1;
}

.archive-info-header {
    display: flex;
    white-space: nowrap;
}

.id {
    margin-right: .5em;
}

.archive-info-title-container {
    display: inline-flex;
    flex: 1;
    justify-content: space-between;
    align-items: center;
}

.archive-info-title {
    display: inline-block;
    flex: 1;
    color: #db8e30;
    font-weight: bold;
}

input.archive-info-title {
    max-width: 10em;
    font-size: 1em;
    font-family: inherit;
    padding: 0 .3em;
    margin: 0 -.3em;
    box-shadow: 0 0 .2em #f3aa6d4d inset;
}

.archive-info-content > div > svg:first-child {
    margin-right: .5em;
}

.archive-info-action {
    display: flex;
    flex-flow: column;
    margin-top: 4px;
}

.archive-info-action:deep(> .button) {
    margin-bottom: .8rem;
}
</style>
