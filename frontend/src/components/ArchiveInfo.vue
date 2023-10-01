<script setup lang="ts">
import { ARCHIVE_VERSION } from '@store/archive'

import NyaDate from '@comp/NyaDate.vue'
import LongPressButton from '@comp/LongPressButton.vue'
import NyaConfirmInput from '@comp/NyaConfirmInput.vue'

import type { IArchiveInfo } from '@type'

type INoInfoReason = 'noAccount' | 'noRemote' | 'noLocal'

defineProps<{
    info?: Omit<IArchiveInfo, 'version'> & { version?: string }
    id?: string
    active?: boolean
    remote?: boolean
    noInfoReason?: INoInfoReason
    isImporting?: boolean
}>()

const emit = defineEmits<{
    (event: 'upload-here'): void
}>()

const noInfoReasons: Record<INoInfoReason, string> = {
    noAccount: 'ログインしていません',
    noRemote: 'アップロードしていません',
    noLocal: 'ダウンロードしていません'
}
</script>

<template>
    <div
        class="archive-info card"
        :class="{ barber: active, message: ! info }"
    >
        <template v-if="isImporting">
            <div class="archive-importing-mask-switch" v-if="id">
                <fa-icon icon="eye" class="button" />
            </div>
            <div
                class="archive-info message importing-mask card"
            >
                <div>
                    <span class="id">{{ id ?? '新' }}</span>
                    <LongPressButton
                        @long-press="emit('upload-here')"
                        icon="file-import"
                        color="var(--color-fg)"
                        desc="アップロード"
                        :delay=".5"
                    />
                </div>
            </div>
        </template>
        <template v-if="info">
            <div class="archive-info-content">
                <div class="archive-info-header">
                    <span v-if="id !== undefined" class="id">{{ id }}</span>
                    <div class="archive-info-title">
                        <NyaConfirmInput
                            v-model="info.title"
                            :disabled="remote"
                        />
                    </div>
                </div>
                <div>
                    <fa-icon icon="calendar" :fixed-width="true" />
                    <NyaDate :date="info.accessTime" format="YYYY-MM-DD hh:mm:ss" />
                </div>
                <div>
                    <fa-icon icon="folder" :fixed-width="true" />
                    <span><span class="number">{{ info.wordCount ?? 'N/A' }}</span> 単語</span>
                </div>
                <div>
                    <fa-icon icon="box" :fixed-width="true" />
                    <span><span class="number">{{ (info.size / 1024).toFixed(2) }}</span> KiB</span>
                </div>
                <div>
                    <fa-icon icon="code" :fixed-width="true" />
                    <span>
                        v<span class="number">{{ info.version ?? '?' }}</span>
                        <span v-if="info?.version && info.version !== ARCHIVE_VERSION">
                            &nbsp;<fa-icon icon="triangle-exclamation" />
                        </span>
                    </span>
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
    min-height: 9.5em;
}

.archive-info.message {
    justify-content: space-around;
    align-items: center;
    color: var(--color-ui);
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

.archive-info-title {
    flex: 1;
    justify-content: space-between;
    align-items: center;
    color: var(--color-ui);
    font-weight: bold;
}

.archive-info-title > .nya-confirm-input:deep(> input) {
    width: 100%;
    color: var(--color-ui);
    font-weight: bold;
    font-family: inherit;
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
    padding-top: .5em;
}

.archive-labels:deep(> div) {
    background-color: var(--color-ui-bg-alt);
    padding: .2em .5em;
    border-radius: 0 .5em .5em 0;
    box-shadow: 0 0 .4em var(--color-shad-ui);
    margin-top: .5em;
}

.importing-mask {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
    box-shadow: none;
    transition: .3s opacity linear;
}

.archive-importing-mask-switch {
    position: absolute;
    left: 0;
    bottom: 0;
    z-index: 2;
}
.archive-importing-mask-switch > svg.button {
    padding: .4em;
}
.archive-importing-mask-switch:active + .importing-mask {
    opacity: 0;
}
</style>
