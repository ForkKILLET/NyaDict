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

export type Grade = 'top' | 'high' | 'medium' | 'low' | 'none'
export const gradeColors: Record<Grade, string> = {
    top: '#39d353',
    high: '#26a641',
    medium: '#006d32',
    low: '#0e4429',
    none: '#eee'
}  
export const gradeBy = (x: number, base: number): Grade => {
    if (x >= base * .9) return 'top'
    if (x >= base * .5) return 'high'
    if (x >= base * .1) return 'medium'
    if (x >= 0) return 'low'
    return 'none'
}

export const downloadURL = (url: string, filename: string) => {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
}

export const randomColor = () => '#' + ('000000' + Math.random().toString(16).replace('.', '')).slice(- 6)
