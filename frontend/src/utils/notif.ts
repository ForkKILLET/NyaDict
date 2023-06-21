import { reactive } from 'vue'
import { NyaResp } from '../types/network'

export type NotiType = 'error' | 'success' | 'info' | 'pending'

export type Noti = {
    content: string
    type: NotiType
    duration?: number
}

export const notis = reactive<Array<Noti | undefined>>([])

export const add = (noti: Noti): number => {
    noti = reactive(noti)
    notis.push(noti)
    return notis.length - 1
}

export const handleResp = async <T>(options: {
    name: string
    silentSuccess?: boolean
    action: () => Promise<NyaResp<T>>
}) => {
    const id = add({
        content: `${options.name}しています`,
        type: 'pending'
    })

    const resp = await options.action()

    remove(id)

    if (resp?.statusCode === 200) {
        if (! options.silentSuccess) add({
            content: `${options.name}・完了`,
            type: 'success',
            duration: 2 * 1000
        })
        return resp
    }

    let content: string
    if (! resp) content = `${options.name}・エラー`
    else content = resp.message

    add({
        content,
        type: 'error',
        duration: 3 * 1000
    })
}

export const remove = (notiId: number): boolean => {
    if (! notis[notiId]) return false
    notis[notiId] = undefined
    return true
}
