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

export type GroupByResult<R extends string, U> = {
    [key in R]?: U[]
}
export const groupBy = <R extends string, T, U = T>(items: T[], group: (item: T) => R, map?: (item: T) => U): GroupByResult<R, U> => {
    const result: GroupByResult<R, U> = {}
    items.forEach(item => {
        const groupName = group(item)
        ; (result[groupName] ??= []).push((map ? map(item) : item) as U)
    })
    return result
}

export const filterN = <T>(items: T[], count: number, pred: (item: T) => boolean) => {
    const filtered: T[] = []
    for(const item of items) {
        if (pred(item)) {
            filtered.push(item)
            if (filtered.length === count) break
        }
    }
    return filtered
}

export type IsEqual<T> = (a: T, b: T) => boolean

export const curry = <A, B extends any[], R>(f: (arg: A, ...rest: B) => R) =>
    (arg: A) => (...rest: B): R => f(arg, ...rest)

export const intersect = <T>(a: T[], b: T[], comp: IsEqual<T>): [T[], T[], T[]] => {
    const equalTo = curry(comp)
    const i: T[] = [], a2: T[] = [], b2: T[] = []
    a.forEach(item => {
        if (b.some(equalTo(item))) i.push(item)
        else a2.push(item)
    })
    b.forEach(item => {
        if (! i.some(equalTo(item))) b2.push(item)
    })
    return [ i, a2, b2 ] 
}

export const dedup = <T>(items: T[], comp: IsEqual<T>): T[] => (
    items.filter((a, index) => ! items.slice(0, index).some(b => comp(a, b)))
)

Object.assign(window, { dedup, intersect, curry })

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
