import Mitt from 'mitt'

export type Events = {
    'data:word:graph': { wordId: number | '*' }
}

export const mitt = Mitt<Events>()
