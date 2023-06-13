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
    <Card class="sync-info" :class="{ barber: active }">
        <div class="sync-info-content">
            <div class="sync-info-header">
                <span v-if="id !== undefined" class="id">{{ id }}</span>
                <div class="sync-info-title-container">
                    <template v-if="! editMode">
                        <span class="sync-info-title">{{ info.title }}</span>
                        <fa-icon @click="startEditing" icon="edit" class="button"></fa-icon>
                    </template>
                    <template v-else>
                        <input
                            type="text"
                            autofocus="true"
                            v-model="newTitle"
                            class="sync-info-title"
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
        <div class="sync-info-action">
            <slot></slot>
        </div>
    </Card>
</template>

<style scoped>
.sync-info {
    display: flex;
    justify-content: space-between;
}

.sync-info-content {
    flex: 1;
}

.sync-info-header {
    display: flex;
    white-space: nowrap;
}

.id {
    margin-right: .5em;
}

.sync-info-title-container {
    display: inline-flex;
    flex: 1;
    justify-content: space-between;
    align-items: center;
}

.sync-info-title {
    display: inline-block;
    flex: 1;
    color: #db8e30;
    font-weight: bold;
}

input.sync-info-title {
    max-width: 10em;
    font-size: 1em;
    font-family: inherit;
    padding: 0 .3em;
    margin: 0 -.3em;
    box-shadow: 0 0 .2em #f3aa6d4d inset;
}

.sync-info-content > div > svg:first-child {
    margin-right: .5em;
}

.sync-info-action {
    display: flex;
    flex-flow: column;
    margin-top: 4px;
}

.sync-info-action:deep(> .button) {
    margin-bottom: .8rem;
}
</style>
