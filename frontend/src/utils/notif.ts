import { reactive, type CSSProperties } from 'vue'
import { NyaResp } from '@type/network'

export type NotiType = 'error' | 'success' | 'info' | 'pending' | 'charge'

export type Noti = {
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

export const addNoti = (noti: Noti): number => {
    noti = reactive(noti)
    notis.push(noti)
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
