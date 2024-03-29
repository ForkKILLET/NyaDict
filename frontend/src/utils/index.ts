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

export const shuffle = <T>(items: T[]) => {
    const { length } = items
    let index = - 1
    while (++ index < length) {
        const rand = random(index, length)
        const value = items[rand]
        items[rand] = items[index]
        items[index] = value
    }
    return items
}

export type GroupByResult<R extends string, U> = {
    [key in R]?: U[]
}
export const groupBy = <R extends string, T, U = T>(
    items: T[],
    group: (item: T) => R | undefined,
    map?: (item: T) => U
): GroupByResult<R, U> => {
    const result: GroupByResult<R, U> = {}
    items.forEach(item => {
        const groupName = group(item)
        if (groupName === undefined) return
        ; (result[groupName] ??= []).push((map ? map(item) : item) as U)
    })
    return result
}

export const groupByPred = <T>(items: T[], pred: (item: T) => boolean): [ T[], T[] ] => {
    const others: T[] = []
    const filtered = items.filter(x => {
        if (pred(x)) return true
        others.push(x)
        return false
    })
    return [ filtered, others ]
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

export const equalOn = <K extends string>(key: K) => <T extends { [k in K]: unknown }>(a: T, b: T) => a[key] === b[key]

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

export const diff = <T>(source: T[], dist: T[], comp: IsEqual<T>): { added: T[], removed: T[] } => {
    const equalTo = curry(comp)
    return {
        added: dist.filter(item => ! source.some(equalTo(item))),
        removed: source.filter(item => ! dist.some(equalTo(item)))
    }
}

export const dedup = <T>(items: T[], comp: IsEqual<T>): T[] => (
    items.filter((a, index) => ! items.slice(0, index).some(b => comp(a, b)))
)

export const sumOf = (items: number[]) => items.reduce((a, c) => a + c, 0)

export const avgOf = (items: number[]) => sumOf(items) / items.length

export type Grade = 'outliner' | 'top' | 'high' | 'medium' | 'low' | 'none'
export const gradeColors: Record<Grade, string> = {
    outliner: '#39d353',
    top: '#39d353',
    high: '#26a641',
    medium: '#006d32',
    low: '#0e4429',
    none: 'var(--color-chart-bg)'
}

export const grade = (items: number[]): Grade[] => {
    const avg = avgOf(items)
    const deltas = items.map(x => x - avg)
    const mad = avgOf(deltas)
    const nmad = mad * 2.5
    const itemsT = items.filter((_, i) => deltas[i] <= nmad * 2.5)
    const avgT = avgOf(itemsT)
    return deltas.map((d, index): Grade => {
        if (d > nmad) return 'outliner'
        const x = items[index]
        if (x === 0) return 'none'
        if (x >= avgT * 5) return 'top'
        if (x >= avgT * 2.5) return 'high'
        if (x >= avgT * .5) return 'medium'
        return 'low'
    })
}

export const randomColor = () => '#' + ('000000' + Math.random().toString(16).replace('.', '')).slice(- 6)

export const unreachable = () => Error('Unreachable')

export const notNullish = <T = any>(val?: T | null | undefined): val is T => (
    val !== null && val !== undefined
)
