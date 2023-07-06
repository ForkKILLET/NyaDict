<script setup lang="ts">
import { ref } from 'vue'
import type { IArchiveInfo } from '../types'
import NyaDate from './NyaDate.vue'

type INoInfoReason = 'noAccount' | 'noRemote' | 'noLocal'

const props = defineProps<{
    info?: IArchiveInfo
    id?: string
    active?: boolean
    remote?: boolean
    noInfoReason?: INoInfoReason
}>()

const noInfoReasons: Record<INoInfoReason, string> = {
    noAccount: 'ログインしていません',
    noRemote: 'アップロードしていません',
    noLocal: 'ダウンロードしていません'
}

const editMode = ref(false)
const newTitle = ref('')
const startEditing = () => {
    if (! props.info) return
    newTitle.value = props.info.title
    editMode.value = true
}
const endEditing = () => {
    if (! props.info) return
    props.info.title = newTitle.value
    editMode.value = false
}
</script>

<template>
    <div
        class="archive-info card"
        :class="{ barber: active, none: ! info }"
    >
        <template v-if="info">
            <div class="archive-info-content">
                <div class="archive-info-header">
                    <span v-if="id !== undefined" class="id">{{ id }}</span>
                    <div class="archive-info-title-container">
                        <template v-if="! editMode">
                            <span class="archive-info-title">{{ info.title }}</span>
                            <fa-icon
                                v-if="! remote"
                                @click="startEditing"
                                icon="edit"
                                class="button" 
                            />
                        </template>
                        <template v-else>
                            <input
                                type="text"
                                autofocus="true"
                                v-model="newTitle"
                                class="archive-info-title"
                            />
                            <fa-icon
                                @click="endEditing"
                                icon="circle-check"
                                class="button"
                            />
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
        </template>
        <template v-else>
            <span class="no-info-reason">{{ noInfoReasons[noInfoReason!] }}</span>
        </template>
        <div class="archive-labels">
            <slot name="labels"></slot>
        </div>
    </div>
</template>

<style scoped>
.archive-info {
    position: relative;
    display: flex;
    justify-content: space-between;
}

.archive-info.none {
    justify-content: space-around;
    align-items: center;
    color: #db8e30;
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

.archive-remote-mark {
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
    margin-top: -2px;
}

.archive-info-action:deep(> svg.button) {
    padding-top: .4rem;
    padding-bottom: .4rem;
}
.archive-info-action:deep(> *:not(:last-child)) {
    margin-bottom: .4rem;
}

.archive-labels {
    position: absolute;
    left: 100%;
    top: 0;
    z-index: -1;
    padding-top: 1em;
}

.archive-labels:deep(> div) {
    background-color: #f9e9dc;
    padding: .2em .5em;
    border-radius: 0 .5em .5em 0;
    box-shadow: 0 0 .4em #faad704d;
}
</style>
