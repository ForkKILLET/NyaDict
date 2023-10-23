<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { useAuth } from '@store/auth'
import { useArchive, ARCHIVE_VERSION } from '@store/archive'

import { downloadURL } from '@util/dom'
import { json5Stringify, json5TryParse } from '@util/storage'
import { addNoti, handleResp } from '@util/notif'

import ArchiveInfo from '@comp/ArchiveInfo.vue'
import LongPressButton from '@comp/LongPressButton.vue'

import type { IArchiveInfo, IPortableArchive } from '@type'
import type {
    IRemoteArchiveInfo, IArchiveGetMineResp, IArchiveUploadResp, IArchiveDownloadResp
} from '@type/network'

const archiveStore = useArchive()
const authStore = useAuth()
const { jwtPayload } = storeToRefs(authStore)
const { api } = authStore
const { currentId, archiveInfo } = storeToRefs(archiveStore)

type RemoteArchives = Record<string, IRemoteArchiveInfo>
const remoteInfo = ref<RemoteArchives | null>(null)

type ArchiveGroupState = 'push-ff' | 'pull-ff' | 'up-to-date' | 'conflict'
type ArchiveGroup = {
    local?: IArchiveInfo
    remote?: IRemoteArchiveInfo
    state: ArchiveGroupState
    pullIcon: string
    pushIcon: string
}
const getGroupState = (group: Partial<ArchiveGroup>): ArchiveGroupState => {
    if (! group.local) return 'pull-ff'
    if (! group.remote) return 'push-ff'

    const localChain = group.local.editionChain ?? []
    const remoteChain = group.remote.editionChain ?? []
    
    if (! remoteChain.length) remoteChain.push({
        time: 0,
        device: '未知設備'
    })
    
    for (let i = 0; i < Math.max(localChain.length, remoteChain.length); i ++) {
        const le = localChain.at(i)
        const re = remoteChain.at(i)
        if (! le) return 'pull-ff'
        if (! re) return 'push-ff'
        if (le.time !== re.time) return 'conflict'
    }
    return 'up-to-date'
}
const archiveGroups = computed(() => {
    const groups: Record<string, Partial<ArchiveGroup>> = {}
    const local = archiveInfo.value
    const remote = remoteInfo.value

    for (const id in local) {
        groups[id] = { local: local[id] }
    }
    if (remote) for (const id in remote) {
        groups[id] ??= {}
        groups[id].remote = remote[id]
    }

    // Calc state

    for (const id in groups) {
        const group = groups[id]
        const state = getGroupState(group)
        group.state = state
        switch (state) {
            case 'conflict':
                group.pushIcon = group.pullIcon = 'triangle-exclamation'
                break
            case 'up-to-date':
                group.pushIcon = group.pullIcon = 'check'
                break
            case 'pull-ff':
                group.pushIcon = 'minus'
                group.pullIcon = 'cloud-arrow-down'
                break
            case 'push-ff':
                group.pushIcon = 'cloud-arrow-up'
                group.pullIcon = 'minus'
                break
        }
    }

    return groups as Record<string, ArchiveGroup>
})

const jsons: Record<string, string> = {}
const blobs: Record<string, Blob> = {}
 
const makeBlob = (id: string) => {
    blobs[id] = new Blob([
        jsons[id] = json5Stringify(archiveStore.exportArchive(id), '"')
    ])
    archiveInfo.value[id].size = blobs[id].size
}
const withdraw = (id: string) => {
    delete archiveInfo.value[id]
    archiveStore.withdrawArchive(id)
    currentId.value = Object.keys(archiveInfo.value)[0]
}
const exports = (id: string, remake?: boolean) => {
    if (remake) {
        makeBlob(id)
        addNoti({
            type: 'success',
            content: 'ダウンロード・リンクを作り直しました',
            duration: 2 * 1000
        })
    }

    const url = URL.createObjectURL(blobs[id])
    downloadURL(url, `nyadict-${archiveInfo.value[id].title}-${Date.now()}.json`)
    URL.revokeObjectURL(url)
}

const selectedFile = ref<File>()
const selectedTitle = computed(() => {
    if (! selectedFile.value) return
    const { name } = selectedFile.value
    return name.match(/^nyadict-(.+?)-\d+\.json$/)?.[1]
        ?? name.match(/^(.+?)\.json$/)?.[1]
        ?? name
})
const onSelectFile = (event: Event) => {
    selectedFile.value = (event.currentTarget as HTMLInputElement).files?.[0]
}
const imports = async (id?: string) => {
    const file = selectedFile.value
    if (! file) return

    const newJSON = await file.text()
    const newData: IPortableArchive = json5TryParse(newJSON)
    if (newData?._info?.version !== ARCHIVE_VERSION) return

    selectedFile.value = undefined

    if (! id) {
        let newId = 0
        for (const id in archiveInfo.value) newId = Math.max(+ id, newId)
        id = String(newId + 1)
    }

    archiveStore.importArchive(id, newData)

    if (currentId.value === id) {
        archiveStore.reloadArchive()
    }
}

const getRemoteInfo = async () => {
    const resp = await handleResp({
        name: 'アーカイブ・リストを取得',
        silentSuccess: true,
        action: async () => await api.get('/archive/mine') as IArchiveGetMineResp
    })
    if (! resp) return

    const remotes: RemoteArchives = {}
    resp.forEach(info => {
        remotes[info.idPerUser] = info
    })
    remoteInfo.value = remotes
}
const push = async (id: string, state: ArchiveGroupState) => {
    const info = archiveInfo.value[id]

    const isFf = state === 'push-ff'
    if (! isFf) {
        const doOverwrite = await new Promise(res => addNoti({
            type: 'info',
            content: `リモート・アーカイブは${
                state === 'pull-ff' ? 'より更新されます' :
                state === 'up-to-date' ? '最新です' :
                state === 'conflict' ? 'すれ違います' :
                ''
            }。上書きしますか。`,
            actions: [
                {
                    info: 'はい',
                    onClick: () => res(true)
                },
                {
                    info: 'いいえ',
                    primary: true,
                    onClick: () => res(false)
                }
            ],
            closable: false,
            onClose: () => res(false)
        }))
        if (! doOverwrite) return
    }

    const activeEdition = info.editionChain?.at(- 1)
    if (! activeEdition) return
    delete activeEdition.active

    const resp = await handleResp({
        name: isFf ? 'プッシュ' : 'プッシュ（上書き）',
        action: async () => await api.post('/archive/upload', {
            ...info,
            idPerUser: id,
            content: jsons[id],
            public: false
        }) as IArchiveUploadResp
    })
    if (! resp) return

    await getRemoteInfo()
}
const pull = async (id: string, state: ArchiveGroupState) => {
    const isFf = state === 'pull-ff'
    if (! isFf) {
        const doOverwrite = await new Promise(res => addNoti({
            type: 'info',
            content: `ローカル・アーカイブは${
                state === 'push-ff' ? 'より更新されます' :
                state === 'up-to-date' ? '最新です' :
                state === 'conflict' ? 'すれ違います' :
                ''
            }。上書きしますか。`,
            actions: [
                {
                    info: 'はい',
                    onClick: () => res(true)
                },
                {
                    info: 'いいえ',
                    primary: true,
                    onClick: () => res(false)
                }
            ],
            closable: false,
            onClose: () => res(false)
        }))
        if (! doOverwrite) return
    }

    const resp = await handleResp({
        name: isFf ? 'プル' : 'プル（上書き）',
        action: async () => await api.get(`/archive/mine/${id}`) as IArchiveDownloadResp
    })
    if (! resp) return

    archiveInfo.value[resp.idPerUser] = {
        version: resp.version,
        title: resp.title,
        size: resp.size,
        wordCount: resp.wordCount,
        editionChain: resp.editionChain
    }

    const newData = json5TryParse(resp.content) as IPortableArchive
    if (! newData) return
    archiveStore.importArchive(id, newData, true)

    makeBlob(id)

    if (currentId.value === resp.idPerUser) {
        archiveStore.reloadArchive()
    }
}

const create = () => {
    const newId = Math.max(- 1, ...Object.keys(archiveGroups.value).map(Number)) + 1
    archiveStore.createArchive(newId)
}

const route = useRoute()
const refresh = async () => {
    for (const id in archiveInfo.value) {
        makeBlob(id)
    }
    if (jwtPayload.value) await getRemoteInfo()
    if (! Object.keys(archiveGroups.value).length) {
        create()
    }
}
watch(route, ({ path }) => {
    if (path === '/sync') refresh()
}, { immediate: true })
</script>

<template>
    <div class="archive-list">
        <p class="archive-list-title">
            <span class="number">{{
                Object.keys(archiveGroups).length
            }}</span> アーカイブ 

            <label for="file">
                <fa-icon icon="file-arrow-up" class="button" />
            </label>
            <input id="file" type="file" accept=".json" @change="onSelectFile" />
            
            <fa-icon @click="create" icon="circle-plus" class="button" />

            <fa-icon @click="getRemoteInfo" icon="rotate" class="button" />
        </p>
        <div class="archive-list-entries scroll-y">
            <div v-if="selectedFile && selectedTitle" class="archive-entry">
                <ArchiveInfo
                    id="アップ"
                    :info="{
                        title: selectedTitle,
                        size: selectedFile.size,
                    }"
                >
                    <fa-icon
                        @click="selectedFile = undefined"
                        icon="trash" class="button"
                    />
                </ArchiveInfo>

                <ArchiveInfo
                    :is-importing="true"
                    @upload-here="imports()"
                />
            </div>

            <div
                v-for="{ local, remote, state, pullIcon, pushIcon }, id in archiveGroups"
                :key="id"
                class="archive-entry"
            >
                <ArchiveInfo
                    :active="id === currentId"
                    :id="id"
                    :info="local"
                    :no-info-reason="'no-local'"
                    :is-importing="!! selectedFile"
                    @upload-here="imports(id)"
                >
                    <fa-icon
                        @click="currentId !== id && (currentId = id)"
                        class="button"
                        :icon="currentId === id ? 'flag-checkered' : 'flag'"
                        :fixed-width="true"
                    />
                    <fa-icon
                        @click="(event: MouseEvent) => exports(id, event.shiftKey)"
                        class="button"
                        icon="file-arrow-down"
                        :fixed-width="true"
                    />
                    <LongPressButton
                        @long-press="push(id, state)"
                        :icon="pushIcon"
                        color="var(--color-fg)"
                        desc="プッシュ"
                        :delay=".5"
                    />
                    <LongPressButton
                        @long-press="withdraw(id)"
                        icon="trash"
                        color="var(--color-wrong)"
                        desc="削除"
                        :delay="1.5"
                    />
                </ArchiveInfo>

                <ArchiveInfo
                    :active="false"
                    :id="remote?.idPerUser"
                    :remote="true"
                    :info="remote"
                    :no-info-reason="jwtPayload ? 'no-remote' : 'no-account'"
                >
                    <template #default>
                        <LongPressButton 
                            @long-press="pull(id, state)"
                            :icon="pullIcon"
                            color="var(--color-fg)"
                            desc="プル"
                            :delay=".5"
                        />
                    </template>
                    <template #labels>
                        <div>
                            <fa-icon icon="cloud" />
                        </div>
                    </template>
                </ArchiveInfo>
            </div>
        </div>
    </div>
</template>

<style scoped>
.archive-list {
    display: flex;
    flex-flow: column;
}

.archive-list-entries {
    flex: 1;
    margin: -1em -.5em;
    padding: 1em;
}

.archive-entry {
    display: flex;
    flex-wrap: wrap;
}

.archive {
    flex-basis: calc(50% - 2.5em - .8em);
    flex-grow: 0;
    margin: 0 2.5em 1.5em .8em;
}

@media screen and (orientation: portrait) and (max-device-width: 600px) {
    .archive {
        flex-basis: 100%;
    }

    .archive-entry {
        margin-bottom: 1.5em;
    }
}

#file {
    width: 0;
    height: 0;
    opacity: 0;
}
</style>
