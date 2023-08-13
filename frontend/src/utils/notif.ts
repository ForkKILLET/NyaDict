import { reactive, type CSSProperties } from 'vue'
import type { NyaResp } from '@type/network'
import type { DistributiveOmit } from '@/types/tool'

export type NotiType = 'error' | 'success' | 'info' | 'pending' | 'charge'

export type Noti = {
    createTime: number
    content: string
    duration?: number
    style?: CSSProperties
} & (
    | {
        type: Exclude<NotiType, 'charge'>
    }
    | {
        type: 'charge'
        icon: string
    }
)

export const notis = reactive<Noti[]>([])

export const addNoti = (noti: DistributiveOmit<Noti, 'createTime'>): number => {
    notis.push(reactive({ ...noti, createTime: Date.now() }))
    return notis.length - 1
}

export const removeNoti = (notiId: number): boolean => {
    if (! notis[notiId]) return false
    delete notis[notiId]
    return true
}

export const handleResp = async <T>(options: {
    name: string
    silentSuccess?: boolean
    action: () => Promise<NyaResp<T>>
}) => {
    const id = addNoti({
        content: `${options.name}しています`,
        type: 'pending'
    })

    const resp = await options.action()

    removeNoti(id)

    if (resp?.statusCode === 200) {
        if (! options.silentSuccess) addNoti({
            content: `${options.name}・完了`,
            type: 'success',
            duration: 2 * 1000
        })
        return resp
    }

    let content: string
    if (! resp) content = `${options.name}・エラー`
    else content = resp.message

    addNoti({
        content,
        type: 'error',
        duration: 3 * 1000
    })
}
