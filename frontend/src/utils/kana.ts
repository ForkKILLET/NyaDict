import { isHiragana, toHiragana } from 'wanakana'

export const strictToHiragana = (input: string | undefined | null) => {
    if (! input) return undefined
    const hiragana = toHiragana(input)
    return isHiragana(hiragana) ? hiragana : undefined
}
