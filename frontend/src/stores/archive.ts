import {
    watch, toValue, shallowReactive, computed,
    type WritableComputedRef, type UnwrapRef, ref
} from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { storeRef, storeReactive, setStorageRaw, delStorage } from '@util/storage'
import { kDispose } from '@util/disposable'
import { mitt } from '@util/mitt'
import { handleResp } from '@util/notif'

import { useConfig } from '@store/config'
import { useAuth } from '@store/auth'

import type { IArchiveInfo, IArchiveData, IPortableArchive, IArchiveVersion } from '@type'
import type { IArchiveGetMineResp, IRemoteArchiveInfo } from '@type/network'

export const ARCHIVE_VERSION: IArchiveVersion = '3.1'

export type IRemoteArchives = Record<string, IRemoteArchiveInfo>
export type IArchiveGroupState = 'push-ff' | 'pull-ff' | 'up-to-date' | 'conflict'
export type IArchiveGroup = {
    local?: IArchiveInfo
    remote?: IRemoteArchiveInfo
    state: IArchiveGroupState
    pullIcon: string
    pushIcon: string
}

export const useArchive = defineStore('archives', () => {
    const { config } = storeToRefs(useConfig())
    const { api } = useAuth()

    const currentId = storeRef('archiveId', '0')
    const localArchivesInfo = storeReactive<Record<string, IArchiveInfo>>('archiveInfo', {})
    const remoteArchivesInfo = ref<IRemoteArchives | null>(null)
    const currentInfo = computed(() => localArchivesInfo[currentId.value])

    const getGroupState = (group: Partial<IArchiveGroup>): IArchiveGroupState => {
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
        const groups: Record<string, Partial<IArchiveGroup>> = {}
        const local = localArchivesInfo
        const remote = remoteArchivesInfo.value

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

        return groups as Record<string, IArchiveGroup>
    })

    const fetchRemoteArchivesInfo = async (forcely = false) => {
        if (! forcely && remoteArchivesInfo.value) return

        const resp = await handleResp({
            name: 'アーカイブ・リストを取得',
            silentSuccess: true,
            action: async () => await api.get('/archive/mine') as IArchiveGetMineResp
        })
        if (! resp) return

        const remotes: IRemoteArchives = {}
        resp.forEach(info => {
            remotes[info.idPerUser] = info
        })
        remoteArchivesInfo.value = remotes
    }

    const archiveData = shallowReactive({} as IArchiveData)

    const archiveItemHooks: Array<{
        load: (data: IArchiveData) => (newId: string) => void
    }> = []

    const define = <K extends keyof IArchiveData>(
        name: K, getItem: (key: string) => IArchiveData[K]
    ) => {
        const load = (data: IArchiveData) => (newId: string) => {
            const oldItem = archiveData[name]
            if (oldItem) oldItem[kDispose]()

            const key = `${newId}:${name}`
            const item = data[name] = getItem(key)
            const origDisposer = item[kDispose]
            const updateWatchDiposer = watch(archiveData[name], () => {
                mitt.emit('data:archive:update', { dataName: name })
            }, { deep: true })
            item[kDispose] = () => {
                origDisposer()
                updateWatchDiposer()
            }
        }
        archiveItemHooks.push({ load })
        watch(currentId, load(archiveData), { immediate: true })
    }

    const reloadArchive = () => {
        const newId = currentId.value
        archiveItemHooks.forEach(({ load }) => load(archiveData)(newId))
    }

    const disposeArchive = (data: IArchiveData) => {
        for (const name in data) {
            const item = data[name as keyof IArchiveData]
            if (kDispose in item) item[kDispose]()
        }
    }

    const exportArchive = (id?: string): IPortableArchive => {
        id ??= currentId.value
        const prefix = id + ':'
        const prefixLen = prefix.length
        const json: any = {}
        const { length } = localStorage

        for (let i = 0; i < length; i ++) {
            const key = localStorage.key(i)
            if (! key?.startsWith(prefix)) continue

            const value = localStorage[key]
            json[key.slice(prefixLen)] = value
        }
        return Object.assign(json, { _info: toValue(localArchivesInfo[id]) })
    }

    const withdrawArchive = (id: string) => {
        for (const key in localStorage) {
            if (key.startsWith(id + ':')) delStorage(key)
        }
    }

    const importArchive = (id: string, portable: IPortableArchive, noInfo?: boolean) => {
        if (portable._info?.version !== ARCHIVE_VERSION) return
        if (! noInfo) localArchivesInfo[id] = portable._info
        delete portable['_info']

        withdrawArchive(id)
        const prefix = id + ':'
        for (const key in portable) {
            setStorageRaw(prefix + key, portable[key])
        }
    }

    const createArchive = (id: number) => {
        localArchivesInfo[id] = {
            title: '黙認',
            size: 0,
            wordCount: 1,
            version: ARCHIVE_VERSION
        }
    }

    const updateActiveEdition = (doUpdate: boolean) => {
        const chain = currentInfo.value.editionChain ??= []
        const tail = chain.at(- 1)
        if (! tail?.active) {
            chain.push({
                time: Date.now(),
                device: config.value.deviceName,
                active: true
            })
        }
        else if (doUpdate) {
            tail.time = Date.now()
            tail.device = config.value.deviceName
        }
    }

    // Make sure the initial edition exists
    watch(currentId, () => {
        if (! currentInfo.value) return
        updateActiveEdition(false)
    }, { immediate: true })

    mitt.on('data:archive:update', () => {
        updateActiveEdition(true)
    })

    type IExtractArchiveData<K extends Array<keyof IArchiveData>> = {
        [key in K[number]]: WritableComputedRef<UnwrapRef<IArchiveData[key]>>
    }

    const extractData = <K extends Array<keyof IArchiveData>>(keys: K): IExtractArchiveData<K> => {
        const values: any = {}
        keys.forEach(key => {
            values[key] = computed({
                get: () => archiveData[key].value,
                set: v => archiveData[key].value = v
            })
        })
        return values as IExtractArchiveData<K>
    }

    return {
        currentId, localArchivesInfo, remoteArchivesInfo, currentInfo, archiveData, archiveGroups,
        extractData, define, fetchRemoteArchivesInfo,
        disposeArchive, reloadArchive, exportArchive, withdrawArchive, importArchive, createArchive, updateActiveEdition
    }
})
