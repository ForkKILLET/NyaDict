export const tryJSON = (json: string | null | undefined) => {
    if (json) {
        try {
            return JSON.parse(json)
        }
        catch {}
    }
}

export const random = (a: number, b?: number) => {
    if (b === undefined) return (Math.random() * 1e6 | 0) % a
    return (Math.random() * 1e6 | 0) % (b - a) + a
}

export const randomItem = <T>(items: T[]): T => items[random(items.length)]

export const randomEntry = <T>(items: T[]): [ number, T ] => {
    const index = random(items.length)
    return [ index, items[index] ]
}

export const range = (start: number, end: number) => Array
    .from({ length: end - start })
    .fill(0)
    .map((_, i) => start + i)

export const sample = <T>(items: T[], size: number) => {
    const { length } = items
    items = [...items]
    size = Math.max(Math.min(size, length), 0)
    for (let i = 0; i < size; i ++) {
        const r = random(i, length)
        ; [ items[i], items[r] ] = [ items[r], items[i] ]
    }
    return items.slice(0, size)
}

export const downloadURL = (url: string, filename: string) => {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
}
