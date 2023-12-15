import { defineStore } from 'pinia'
import Schema from 'schemastery'

import { storeReactive } from '@util/storage'

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
        .description('同期 API の URL')
})

export const useConfig = defineStore('config', () => {
    const config = storeReactive<ReturnType<typeof Config>>('config', new Config(), Config)

    return { config }
})
