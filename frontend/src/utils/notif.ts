import { reactive, type CSSProperties } from 'vue'
import type { NyaResp } from '@type/network'
import type { DistributiveOmit } from '@type/tool'

export type NotiType = 'error' | 'success' | 'info' | 'pending' | 'charge'

export type NotiAction = {
    info: string

    onclick: () => boolean | void
}

export type Noti = {
    createTime: number
    content: string
    duration?: number
    style?: CSSProperties
    actions?: NotiAction[]
    closable?: boolean

    onclose?: (data: { expired: boolean }) => void
    onexpire?: () => void
} & ({
    type: Exclude<NotiType, 'charge'>
} | {
    type: 'charge'
    icon: string
})

export const notis = reactive<Noti[]>([])

export const addNoti = (noti: DistributiveOmit<Noti, 'createTime'>): number => {
    notis.push(reactive({ ...noti, createTime: Date.now() }))
    return notis.length - 1
}

export const removeNoti = (notiId: number, expired = false): boolean => {
    const noti = notis[notiId]
    if (! noti) return false
    delete notis[notiId]
    noti.onclose?.({ expired })
    return true
}

export const getNotiId = (noti: Noti): number => {
    return notis.indexOf(noti)
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
