import { defineStore } from 'pinia'
import Schema from 'schemastery'

import { storeReactive } from '@util/storage'

export const Config = Schema.object({
    theme: Schema
        .union([
            Schema.const('default').description('wand-magic').comment('自動'),
            Schema.const('light').description('sun').comment('Light'),
            Schema.const('dark').description('moon').comment('Dark')
        ])
        .default('default')
        .role('icon')
        .description('テーマ'),
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
