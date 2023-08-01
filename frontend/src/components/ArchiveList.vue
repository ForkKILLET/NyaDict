<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@store/auth'
import { useArchive } from '@/stores/archive'
import { downloadURL, tryJSON } from '@util'
import { api } from '@util/api'
import { add as addNoti, handleResp } from '@util/notif'
import ArchiveInfo from '@comp/ArchiveInfo.vue'
import LongPressButton from '@comp/LongPressButton.vue'
import type { IArchiveInfo, IPortableArchive } from '@type'
import type {
    IRemoteArchiveInfo, IArchiveGetMineResp, IArchiveUploadResp, IArchiveDownloadResp
} from '@type/network'

const archiveStore = useArchive()
const { jwtPayload, axiosHeader } = storeToRefs(useAuth())
const { currentId, archiveInfo } = storeToRefs(archiveStore)

type RemoteArchives = Record<string, IRemoteArchiveInfo>
const remoteInfo = ref<RemoteArchives | null>(null)

type ArchiveInfoWithRemote = Record<string, [ IArchiveInfo?, IRemoteArchiveInfo? ]>
const infoWithRemote = computed<ArchiveInfoWithRemote>(() => {
    const base: ArchiveInfoWithRemote = {}
    const local = archiveInfo.value
    for (const id in local) {
        base[id] = [ local[id] ]
    }
    const remote = remoteInfo.value
    if (remote) for (const id in remote) {
        base[id] ??= []
        base[id][1] = remote[id]
    }
    return base
})

const jsons: Record<string, string> = {}
const blobs: Record<string, Blob> = {}
 
const makeBlob = (id: string) => {
    blobs[id] = new Blob([
        jsons[id] = JSON.stringify(archiveStore.exportArchive(id))
    ])
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
    const file = selectedFile.value!
    const newJSON = await file.text()
    const newData: IPortableArchive = tryJSON(newJSON)
    if (newData?._info?.version !== '2') return

    selectedFile.value = undefined

    if (! id) {
        let newId = 0
        for (const id in archiveInfo.value) newId = Math.max(+ id, newId)
        id = String(newId + 1)
    }

    archiveStore.importArchive(id, newData)
}

for (const id in archiveInfo.value) {
    makeBlob(id)
    archiveInfo.value[id].size = blobs[id].size
}

const getRemoteInfo = async () => {
    const resp = await handleResp({
        name: 'アーカイブ・リストを取得',
        silentSuccess: true,
        action: async () => await api.get('/archive/mine', {
            headers: axiosHeader.value
        }) as IArchiveGetMineResp
    })
    if (! resp) return

    const archives: RemoteArchives = {}
    resp.forEach(info => {
        archives[info.idPerUser] = {
            ...info,
            accessTime: + new Date(info.accessTime)
        }
    })
    remoteInfo.value = archives
}
const upload = async (id: string) => {
    const info = archiveInfo.value[id]

    const resp = await handleResp({
        name: 'アップロード',
        action: async () => await api.post('/archive/upload', {
            ...info,
            idPerUser: id,
            content: jsons[id],
            public: false
        }, {
            headers: axiosHeader.value
        }) as IArchiveUploadResp
    })
    if (! resp) return

    await getRemoteInfo()
}

const download = async (id: string) => {
    const resp = await handleResp({
        name: 'ダウンロード',
        action: async () => await api.get(`/archive/mine/${id}`, {
            headers: axiosHeader.value
        }) as IArchiveDownloadResp
    })
    if (! resp) return

    archiveInfo.value[resp.idPerUser] = {
        version: '2',
        title: resp.title,
        size: resp.size,
        wordCount: resp.wordCount,
        accessTime: + new Date(resp.accessTime)
    }

    const newData = tryJSON(resp.content) as IPortableArchive
    if (! newData) return
    archiveStore.importArchive(id, newData)

    makeBlob(id)

    if (currentId.value === resp.idPerUser) {
        archiveStore.reloadArchive()
    }
}

const route = useRoute()
watch(route, ({ path }) => {
    if (path === '/sync' && jwtPayload.value) {
        getRemoteInfo()
    }
}, { immediate: true })
</script>

<template>
    <div class="archive-list">
        <p class="archive-list-title">
            <span class="number">{{
                Object.keys(infoWithRemote).length
            }}</span> アーカイブ 

            <label for="file">
                <fa-icon icon="file-arrow-up" class="button" />
            </label>
            <input id="file" type="file" accept=".json" @change="onSelectFile" />
            
            <fa-icon @click="getRemoteInfo" icon="rotate" class="button" />
        </p>
        <div class="archive-list-entries">
            <div v-if="selectedFile" class="archive-entry">
                <ArchiveInfo
                    id="アップ"
                    :info="{
                        title: selectedTitle!,
                        accessTime: selectedFile.lastModified,
                        size: selectedFile.size,
                        version: 'N/A'
                    }"
                />

                <ArchiveInfo
                    :is-importing="true"
                    @upload-here="imports()"
                />
            </div>

            <div
                v-for="[ local, remote ], id in infoWithRemote"
                class="archive-entry"
            >
                <ArchiveInfo
                    :active="id === currentId"
                    :id="id"
                    :info="local"
                    :no-info-reason="'noLocal'"
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
                        @long-press="upload(id)"
                        icon="cloud-arrow-up"
                        color="#000"
                        :duration=".5"
                    />
                    <LongPressButton
                        @long-press="withdraw(id)"
                        icon="trash"
                        color="#ec4e1e"
                        :duration="1.5"
                    />
                </ArchiveInfo>

                <ArchiveInfo
                    :active="false"
                    :id="remote?.idPerUser"
                    :remote="true"
                    :info="remote"
                    :no-info-reason="jwtPayload ? 'noRemote' : 'noAccount'"
                >
                    <LongPressButton #default
                        @long-press="download(id)"
                        icon="cloud-arrow-down"
                        color="#000"
                        :duration=".5"
                    />
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
    overflow-y: auto;
    margin: -1em -.5em;
    padding: 1em;
    scrollbar-width: none;
}
.archive-list-entries::-webkit-scrollbar {
    display: none;
}

.archive-entry {
    display: flex;
    flex-wrap: wrap;
}

.archive-info {
    flex-basis: calc(50% - 2.5em - .8em);
    flex-grow: 0;
    margin: 0 2.5em 1.5em .8em;
}

@media screen and (orientation: portrait) and (max-device-width: 600px) {
    .archive-info {
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
