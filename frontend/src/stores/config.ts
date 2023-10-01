import { defineStore } from 'pinia'
import Schema from 'schemastery'

import { storeReactive } from '@util/storage'

declare global {
    namespace Schemastery {
        interface Meta<T> {
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
            Schema.const('dark').extra('icon', 'moon').comment('Dark')
        ])
        .default('default')
        .extra('section', '外観')
        .extra('listStyle', 'icon')
        .description('テーマ'),
    wordNavigator: Schema
        .boolean()
        .default(true)
        .extra('section', '外観')
        .description('単語ナビゲーション・ボタン'),
    lazySharp: Schema
        .boolean()
        .default(false)
        .extra('section', '外観')
        .description('タブキーを押すと単語IDを挿入する'),
    syncApi: Schema
        .string()
        .extra('section', '同期')
        .default(import.meta.env.VITE_SYNC_API)
        .description('同期 API の URL')
})

export const useConfig = defineStore('config', () => {
    const config = storeReactive('config', new Config())
    config.value = Config(config)

    return { config }
})
