import { getWordMeanings, getWordSentences } from '@store/words'

import { unreachable } from '@util'
import { strictToHiragana } from '@util/kana'

import { type IWord } from '@type'
import type { Repeated } from '@type/tool'

export type IMatchMethod = 'equals' | 'contains' | 'startswith' | 'endswith'

export type IQuery = {
    type: 'text'
    text: string
    match: IMatchMethod
    object: IQueryTextObject
} | {
    type: 'empty'
    object: IQueryTextObject
} | {
    type: 'time'
    timeStart?: number
    timeEnd?: number
    object: IQueryTimeObject
} | {
    type: 'test'
    testId: number
    correctLevel: number
} | {
    type: 'and'
    filters: IQuery[]
} | {
    type: 'or'
    filters: IQuery[]
} | {
    type: 'not'
    filter: IQuery
}

export type IPos = {
    start: number
    end: number
}

export type IQueryASTCall = IPos & {
    type: 'call'
    ret: IQueryDataType
    verb: IQueryVerbName
    args: IQueryAST[]
}

export type IQueryASTString = IPos & {
    type: 'string'
    value: string
    kana?: string
}

export type IQueryASTObject = IPos & {
    type: 'object'
    name: string
}

export type IQueryAST =
    | IQueryASTCall
    | IQueryASTString
    | IQueryASTObject

export type IQueryTextObject =
    | 'word' | 'disp' | 'sub'
    | 'meaning' | 'sentence'
export type IQueryTimeObject =
    | 'create' | 'test'

export enum QueryTokenType {
    Object,
    Verb,
    String,
    RomajiString,
    LParen,
    RParen,
}

export type IQueryToken = IPos & {
    type: QueryTokenType
    value: string
}

export type IQueryErrorCause = {
    stage: 'Tokenize' | 'Parse' | 'Expand'
    query: string
    error: string
    start: number
    end?: number
}

export class QueryError extends Error {
    constructor(cause: IQueryErrorCause) {
        const spaceCount = cause.start
        const caretCount = cause.end === undefined ? 1 : cause.end - cause.start
        const message
            = `${cause.stage}Error`
            + `\n${cause.query.replace(/[^\u0020-\u007f]/g, '#')}\n` + ' '.repeat(spaceCount) + '^'.repeat(caretCount)
            + ` ${cause.error.replace(/\n/g, '\n' + ' '.repeat(spaceCount + caretCount + 1))}`
        super(message, { cause })
    }
}

export interface QueryError {
    cause: IQueryErrorCause
}

export type IQueryDataType = {
    type: 'object'
    names: string[]
} | {
    type: 'boolean'
} | {
    type: 'string'
}

export type IQueryDataTypeName = `object${Repeated<`:${string}`>}` | 'boolean' | 'string'

export type IQueryVerbDef = {
    parameters: IQueryDataType[]
    returnType: IQueryDataType
}

const _parseType = (type: IQueryDataTypeName): IQueryDataType => {
    if (type === 'boolean' || type === 'string') return { type }
    const [, ...names ] = type.split(':')
    return {
        type: 'object',
        names
    }
}

const _newVerb = (parameters: IQueryDataTypeName[], returnType: IQueryDataTypeName): IQueryVerbDef => ({
    parameters: parameters.map(_parseType),
    returnType: _parseType(returnType)
})

const _isVerb = (name: string): name is IQueryVerbName => name in verbs


const _verbSignature = (verb: string, verbDef: IQueryVerbDef) =>
    `(${verb}) :: (${verbDef.parameters.map(t => `<${t.type}>`).join(' ')}) -> <${verbDef.returnType.type}>`

const _textObject = 'object:word:disp:sub:meaning:sentence'
const _textVerb = _newVerb([ _textObject, 'string' ], 'boolean')

export const verbs = {
    equals: _textVerb,
    contains: _textVerb,
    startswith: _textVerb,
    endswith: _textVerb,
    during: _newVerb([ 'object:create:test', 'string' ], 'boolean'),
    empty: _newVerb([ _textObject ], 'boolean'),
    and: _newVerb([ 'boolean', 'boolean' ], 'boolean'),
    or: _newVerb([ 'boolean', 'boolean' ], 'boolean'),
    not: _newVerb([ 'boolean' ], 'boolean')
} as const

export type IQueryVerbName = keyof typeof verbs

export const verbAliases: Record<string, string> = {
    '=': 'equals',
    '~': 'contains',
    '[': 'startswith',
    ']': 'endswith',
    '&': 'and',
    '|': 'or',
    '!': 'not'
}

const whiteChars = ' \t\r\n\u3000'
const symbolChars = '=~^[]' + '&|!'
const identifierChars
    = 'abcdefghijklmnopqrstuvwxyz'
    + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    + '-'
    + '0123456789'

const _tokenize = (ctx: IQueryContext): IQueryToken[] | null => {
    const tokens: IQueryToken[] = []
    const { query } = ctx
    let index = 0
    let identifierIsObject = false

    while (index < query.length) {
        let char = query[index]

        if (whiteChars.includes(char)) {
            index ++
            continue
        }

        if (char === '(') {
            tokens.push({
                type: QueryTokenType.LParen, value: '(',
                start: index, end: index + 1 })
            index ++
            continue
        }

        if (char === ')') {
            tokens.push({
                type: QueryTokenType.RParen, value: ')',
                start: index, end: index + 1
            })
            index ++
            continue
        }

        if (char === '\'' || char === '"' || char === '`') {
            const quote = char
            const start = index
            let value = ''
            char = query[++ index]
            while (char !== quote && index < query.length) {
                value += char
                char = query[++ index]
            }
            if (char === quote) {
                const end = ++ index
                tokens.push({
                    type:quote === '`' ? QueryTokenType.String : QueryTokenType.RomajiString, value,
                    start, end
                })
            }
            else throw _error({
                stage: 'Tokenize',
                query: query,
                error: 'String not ended',
                start: start,
                end: query.length
            })
            continue
        }

        if (symbolChars.includes(char)) {
            tokens.push({
                type: QueryTokenType.Verb, value: char,
                start: index, end: index + 1
            })
            index ++
            continue
        }

        if (char === ':') {
            identifierIsObject = true
            char = query [++ index]
        }
        if (identifierChars.includes(char)) {
            const start = identifierIsObject ? index - 1 : index
            let value = ''
            do {
                value += char
                char = query[++ index]
            }
            while (identifierChars.includes(char))
            const end = index
            tokens.push({
                type: identifierIsObject ? QueryTokenType.Object : QueryTokenType.Verb, value,
                start, end
            })
            identifierIsObject = false
            continue
        }
        else {
            if (identifierIsObject) throw _error({
                stage: 'Tokenize',
                query: query,
                error: `':' should be followed by object name`,
                start: index - 1,
                end: index
            })
        }

        throw _error({
            stage: 'Tokenize',
            query: query,
            error: `Unexpected char '${char}'.`,
            start: index
        })
    }

    return tokens
}

const _error = (error: IQueryErrorCause) => new QueryError(error)

type IQueryContext = {
    query: string
}

type IQueryParseState = {
    ctx: IQueryContext
    tokens: IQueryToken[]
    index: number
    advance: () => number
    current: IQueryToken
    expect: (expectation: string | null, gotToken: IQueryToken | null) => QueryError
    error: (error: string, position: IPos) => QueryError
}

const _newParseState = (ctx: IQueryContext, tokens: IQueryToken[]): IQueryParseState => {
    const pointer: IQueryParseState = {
        ctx,
        tokens,
        index: 0,
        advance: () => ++ pointer.index,
        get current() {
            return pointer.tokens[pointer.index]
        },
        expect: (expectation, gotToken) => _error({
            stage: 'Parse',
            query: ctx.query,
            error: (expectation === null ? 'Unexpected' : `Expect ${expectation}, but got`) + ` ${
                gotToken === null ? 'end of input' : `[${QueryTokenType[gotToken.type]}]`
            }.`,
            start: gotToken?.start ?? ctx.query.length,
            end: gotToken?.end
        }),
        error: (error, position) => _error({
            stage: 'Parse',
            query: ctx.query,
            error,
            start: position.start,
            end: position.end
        })
    }
    return pointer
}

const enum ParseEndAt {
    EOI,
    RParen
}

const _parse = (state: IQueryParseState, endAt: ParseEndAt, depth: number): IQueryAST | null => {
    const parseOne = (): IQueryAST | null => {
        const { current: token } = state

        if (token === undefined) {
            if (endAt === ParseEndAt.EOI) return null
            else throw state.expect('[RParen]', null)
        }

        if (token.type === QueryTokenType.RParen) {
            if (endAt === ParseEndAt.RParen) return null
            else throw state.expect(null, token)
        }

        if (token.type === QueryTokenType.LParen) {
            state.advance()
            const tree = _parse(state, ParseEndAt.RParen, depth + 1)

            if (state.current?.type !== QueryTokenType.RParen) throw state.expect('[RParen]', state.current ?? null)
            state.advance()

            if (tree) {
                tree.start --
                tree.end ++
            }
            return tree
        }

        if (token.type === QueryTokenType.String || token.type === QueryTokenType.RomajiString) {
            state.advance()
            const tree: IQueryASTString = {
                type: 'string',
                value: token.value,
                start: token.start,
                end: token.end
            }
            if (token.type === QueryTokenType.RomajiString) {
                const kana = strictToHiragana(token.value)
                if (kana) tree.kana = kana
            }
            return tree
        }

        if (token.type === QueryTokenType.Object) {
            state.advance()
            return {
                type: 'object',
                name: token.value,
                start: token.start,
                end: token.end
            }
        }

        throw state.expect(null, token)
    }

    const lhs = parseOne()
    if (! lhs) return null

    const token = state.current
    if (token?.type === QueryTokenType.Verb) {
        let verb = token.value
        if (verb in verbAliases) verb = verbAliases[verb]

        if (! _isVerb(verb)) throw state.error(`Unknown verb '${verb}'`, token)
        const verbDef = verbs[verb as IQueryVerbName]

        const { parameters, returnType } = verbDef
        const args = [ lhs ]

        state.advance()
        const start = lhs.start

        while (true) {
            const arg = _parse(state, endAt, depth + 1)
            if (arg === null) break
            args.push(arg)
        }

        const end = state.current?.start ?? token.end

        if (args.length !== parameters.length)
            throw state.error(`Verb (${verb}) expects ${parameters.length - 1} RHS arguments, but got ${args.length - 1}`, { start, end })
        args.forEach((arg, index) => {
            const argType = arg.type === 'call' ? arg.ret : { type: arg.type }
            const paramType = parameters[index]
            if (argType.type !== paramType.type)
                throw state.error(
                    `Verb (${verb}) expects #${index + 1} argument to be <${paramType.type}>, but got <${argType.type}>.\n` +
                    _verbSignature(verb, verbDef),
                    arg
                )
            if (paramType.type === 'object') {
                const names: string[] = arg.type === 'object' ? [ arg.name ] : (arg as any).ret.names
                if (names.some(name => ! paramType.names.includes(name)))
                    throw state.error(
                        `Verb (${verb}) expects #${index + 1} arguments to be <object${paramType.names.map(t => `:${t}`).join('')}> ` +
                        `but got <object${names.map(t => `:${t}`).join('')}>.\n`
                        + _verbSignature(verb, verbDef),
                        arg
                    )
            }
        })

        return {
            type: 'call',
            verb,
            args,
            ret: returnType,
            start: lhs.start,
            end: args.at(- 1)?.end ?? token.end
        }
    }
    else return lhs
}

const _expand = (ctx: IQueryContext, tree: IQueryAST): IQuery => {
    if (tree.type === 'call') {
        if (tree.verb === 'and' || tree.verb === 'or') {
            return {
                type: tree.verb,
                filters: tree.args.map(arg => _expand(ctx, arg))
            }
        }
        if (tree.verb === 'not') {
            return {
                type: 'not',
                filter: _expand(ctx, tree.args[0])
            }
        }
        if (tree.verb === 'contains' || tree.verb === 'equals' || tree.verb === 'startswith' || tree.verb === 'endswith') {
            const str = tree.args[1] as IQueryASTString
            return {
                type: 'text',
                match: tree.verb,
                object: (tree.args[0] as IQueryASTObject).name as any,
                text: str.kana ?? str.value
            }
        }
        if (tree.verb === 'empty') {
            return {
                type: 'empty',
                object: (tree.args[0] as IQueryASTObject).name as any
            }
        }
        if (tree.verb === 'during') {
            return {
                type: 'time',
                object: (tree.args[0] as IQueryASTObject).name as any,
                // TODO: parse time
                timeStart: 0,
                timeEnd: 0
            }
        }
    }
    throw _error({
        stage: 'Expand',
        query: ctx.query,
        error: `Unexpected ${tree.type}`,
        start: tree.start,
        end: tree.end
    })
}

export type IQueryParseResult = {
    state: 'success'
    structured: IQuery
} | {
    state: 'null'
} | {
    state: 'error'
    error: QueryError
}

export const parse = (query: string): IQueryParseResult => {
    // Support old query
    if (! query.match(/[\s\(\)!@#$%^&*'"`]/)) {
        query = `:word contains '${query}'`
    }

    const ctx = { query }

    try {
        const tokens = _tokenize(ctx)
        if (tokens === null) return { state: 'null' }

        const ast = _parse(_newParseState(ctx, tokens), ParseEndAt.EOI, 0)
        if (ast === null) return { state: 'null' }

        const structured = _expand(ctx, ast)
        return {
            state: 'success',
            structured
        }
    }
    catch (error) {
        return {
            state: 'error',
            error: error as QueryError
        }
    }
}

const _getTextObjectGetter = (object: IQueryTextObject): (word: IWord) => string[] => {
    if (object === 'disp') return word => [ word.disp ]
    if (object === 'sub') return word => [ word.sub ]
    if (object === 'word') return word => [ word.disp, word.sub ]
    if (object === 'meaning') return word => getWordMeanings(word)
    if (object === 'sentence') return word => getWordSentences(word)
    throw unreachable()
}

const _getTextMatcher = (matchMethod: IMatchMethod, source: string): (dist: string) => boolean => {
    if (matchMethod === 'equals') return dist => dist === source
    if (matchMethod === 'contains') return dist => dist.includes(source)
    if (matchMethod === 'startswith') return dist => dist.startsWith(source)
    if (matchMethod === 'endswith') return dist => dist.endsWith(source)
    throw unreachable()
}

export type IQueryFilter = (word: IWord) => boolean

export const compile = (structured: IQuery): IQueryFilter => {
    if (structured.type === 'and') {
        const compiledFs = structured.filters.map(compile)
        return word => compiledFs.every(fn => fn(word))
    }
    if (structured.type === 'or') {
        const compiledFs = structured.filters.map(compile)
        return word => compiledFs.some(fn => fn(word))
    }
    if (structured.type === 'not') {
        const compiledF = compile(structured.filter)
        return word => ! compiledF(word)
    }
    if (structured.type === 'empty') {
        const getObject = _getTextObjectGetter(structured.object)
        return word => ! getObject(word).length
    }
    if (structured.type === 'text') {
        const getObject = _getTextObjectGetter(structured.object)
        const matcher = _getTextMatcher(structured.match, structured.text)
        return word => getObject(word).some(matcher)
    }
    throw unreachable()
}
