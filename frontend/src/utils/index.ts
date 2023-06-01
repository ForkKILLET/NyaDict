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
