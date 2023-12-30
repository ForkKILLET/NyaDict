import { reactive, type CSSProperties, MaybeRef } from 'vue'
import type { NyaResp } from '@type/network'
import type { DistributiveOmit } from '@type/tool'

export type NotiType = 'error' | 'success' | 'info' | 'pending' | 'charge'

export type NotiAction = {
    info: string
    primary?: boolean

    onClick: () => boolean | void
}

export type Noti = {
    id: number
    createTime: number
    content: MaybeRef<string>
    duration?: number
    style?: CSSProperties
    actions?: NotiAction[]
    closable?: boolean

    onClose?: (data: { cause?: string }) => void
    onExpire?: () => void
    onCharge?: () => void
} & ({
    type: Exclude<NotiType, 'charge'>
} | {
    type: 'charge'
    icon: string
})

export const notis = reactive<Noti[]>([])

export const addNoti = (noti: DistributiveOmit<Noti, 'createTime' | 'id'>): number => {
    const id = notis.length
    notis.push(reactive({
        ...noti,
        id,
        createTime: Date.now()
    }))
    return id
}

export const removeNoti = (notiId: number, cause?: string): boolean => {
    const noti = notis[notiId]
    if (! noti) return false
    delete notis[notiId]
    noti.onClose?.({ cause })
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
