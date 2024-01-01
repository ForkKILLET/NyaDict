import { defineStore, storeToRefs } from 'pinia'
import Schema from 'schemastery'

import { storeReactive } from '@util/storage'
import { Ref, computed } from 'vue'
import { RemoveIndex } from '@type/tool'

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Schemastery {
        interface Meta {
            section: string
            icon: string
            listStyle: 'icon' | 'text'
        }
    }
}

export const Config = Schema.object({
    theme: Schema
        .union([
            Schema.const('default').extra('icon', 'wand-magic').comment('自動'),
            Schema.const('light').extra('icon', 'sun').comment('Light'),
            Schema.const('dark').extra('icon', 'moon').comment('Dark'),
            Schema.const('cosmos').extra('icon', 'infinity').comment('Cosmos')
        ])
        .default('default')
        .extra('section', '外観')
        .extra('listStyle', 'icon')
        .description('テーマ'),
    wordNavigator: Schema
        .boolean()
        .default(true)
        .extra('section', '外観')
        .description('単語ナビゲーター'),
    corrProgress: Schema
        .boolean()
        .default(false)
        .extra('section', '外観')
        .description('プログレス・バーに正確さを表示'),
    lazyCompletion: Schema
        .boolean()
        .default(false)
        .extra('section', '辞書編集')
        .description('Tab を押すと補完し始める'),
    autoParen: Schema
        .boolean()
        .default(true)
        .extra('section', '辞書編集')
        .description('自動に右括弧を挿入'),
    deviceName: Schema
        .string()
        .extra('section', '同期')
        .default('未知設備')
        .description('この設備の名'),
    syncApi: Schema
        .string()
        .extra('section', '同期')
        .default(import.meta.env.VITE_SYNC_API)
        .description('同期 API の URL'),
    shortcuts: Schema
        .dict(Schema.string())
        .hidden(),
    wordGraphScale: Schema
        .number()
        .extra('section', '単語リンク・グラフ')
        .default(1)
        .description('グラフのズーム倍率')
        .hidden(),
    wordGraphEdgeType: Schema
        .union([
            Schema.const('all'),
            Schema.const('rel')
        ])
        .extra('section', '単語リンク・グラフ')
        .default('all')
        .description('グラフに表現するリンクの種類')
        .hidden()
})

type ConfigDataRO = ReturnType<typeof Config>
export type ConfigData = {
    -readonly [K in keyof ConfigDataRO]: ConfigDataRO[K]
}

export const useConfig = defineStore('config', () => {
    const config = storeReactive<ConfigData>('config', new Config(), Config)

    return { config }
})

export const useConfigData = () => {
    const { config } = storeToRefs(useConfig())
    return config
}

export const useConfigItem = <K extends keyof RemoveIndex<ConfigData>>(config: Ref<ConfigData>, key: K) => computed({
    get: () => config.value[key],
    set: val => config.value[key] = val
})
