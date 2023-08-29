export const downloadURL = (url: string, filename: string) => {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
}

export type Point = {
    readonly clientX: number
    readonly clientY: number
}

export const getEventPoint = (event: MouseEvent | TouchEvent): Point => {
    if (! window.TouchEvent) return event as MouseEvent
    return event instanceof TouchEvent
        ? [
            ...event.targetTouches,
            ...event.changedTouches,
        ][0]
        : event
}

export const getMainEl = () => document.querySelector('main')
