import { defineStore } from 'pinia'
import Schema from 'schemastery'

import { storeReactive } from '@util/storage'

declare global {
    namespace Schemastery {
        interface Meta<T> {
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
        .extra('listStyle', 'icon')
        .description('テーマ'),
    lazySharp: Schema
        .boolean()
        .default(false)
        .description('タブキーを押すと単語IDを挿入する'),
    syncApi: Schema
        .string()
        .default(import.meta.env.VITE_SYNC_API)
        .description('同期 API の URL')
})

export const useConfig = defineStore('config', () => {
    const config = storeReactive('config', new Config())
    config.value = Config(config)

    return { config }
})
