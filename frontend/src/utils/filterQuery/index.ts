import { strictToHiragana } from '@util/kana'

import type { IWord } from '@type'

import { funcDefs } from '@util/filterQuery/functions'
import type { IQueryDataBasicTypeStr, IQueryDataGenericTypeStr, IQueryFuncName } from '@util/filterQuery/functions'

export type IPos = {
    start: number
    end: number
}

export type IQueryAstCall = IPos & {
    type: 'call'
    funcName: IQueryFuncName
    args: IQueryAst[]
    sig: IQueryFuncSignature
}

export type IQueryAstString = IPos & {
    type: 'string'
    value: string
    kana?: string
}

export type IQueryAstNumber = IPos & {
    type: 'number'
    value: number
}

export type IQueryAst =
    | IQueryAstCall
    | IQueryAstString
    | IQueryAstNumber

export type IQueryTextObject =
    | 'word' | 'disp' | 'sub'
    | 'meaning' | 'sentence'
export type IQueryTimeObject =
    | 'create' | 'test'

export enum QueryTokenType {
    Func,
    String,
    Number,
    RomajiString,
    LParen,
    RParen,
}

export type IQueryToken = IPos & {
    type: QueryTokenType
    value: string
}

export type IQueryProcessStage = 'Tokenize' | 'Parse' | 'Compile'

export type IQueryErrorCause = {
    stage: IQueryProcessStage
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

export type IQueryDataBasicType = {
    kind: 'basic'
    name: IQueryDataBasicTypeStr
}

export type IQueryDataNestedType = {
    kind: 'nested'
    outer: IQueryDataGenericTypeStr
    inner: IQueryDataType
}
export type IQueryDataType = IQueryDataBasicType | IQueryDataNestedType



export type IQueryFuncSignature = {
    parameters: IQueryDataType[]
    returnType: IQueryDataType
    body: (...p: any[]) => any
}

export type IQueryFunc = {
    sigs: IQueryFuncSignature[]
}

const _isFuncName = (name: string): name is IQueryFuncName => name in funcDefs

const _printType =  (type: IQueryDataType): string => {
    switch (type.kind) {
        case 'basic':
            return type.name
        case 'nested':
            return `${type.outer}<${_printType(type.inner)}>`
    }
}
const _printTypeInBracket = (type: IQueryDataType) => `<${_printType(type)}>`
const _printFuncSig = (funcName: string, funcDef: IQueryFunc) => funcDef.sigs.map(sig =>
    `${funcName} :: (${sig.parameters.map(_printTypeInBracket).join(' ')}) -> ${_printTypeInBracket(sig.returnType)}`
).join('\n')

const _isSameType = (t: IQueryDataType, u: IQueryDataType) => {
    if (t.kind !== u.kind) return false
    if (t.kind === 'basic' && u.kind === 'basic') {
        if (t.name !== u.name) return false
    }
    else if (t.kind === 'nested' && u.kind === 'nested') {
        if (t.outer !== u.outer) return false
        if (! _isSameType(t.inner, u.inner)) return false
    }
    return true
}


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
const symbolChars = '=~^[]&|!'
const identifierChars
    = 'abcdefghijklmnopqrstuvwxyz'
    + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    + '-'
    + '0123456789'
    + symbolChars

const _tokenize = (state: IQueryProcessState): IQueryToken[] | null => {
    const tokens: IQueryToken[] = []
    const { query } = state.ctx
    let index = 0

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
                    type: quote === '`' ? QueryTokenType.String : QueryTokenType.RomajiString, value,
                    start, end
                })
            }
            else throw state.error('String not ended', {
                start,
                end: query.length
            })
            continue
        }

        if (/\d/.test(char)) {
            const start = index
            let hasDot = false
            let value = ''
            do {
                if (char === '.') hasDot = true
                value += char
                char = query[++ index]
            }
            while (/\d/.test(char) || (! hasDot && char === '.'))
            const end = index
            tokens.push({
                type: QueryTokenType.Number, value,
                start, end
            })
            continue
        }

        if (identifierChars.includes(char)) {
            const start = index
            let value = ''
            do {
                value += char
                char = query[++ index]
            }
            while (identifierChars.includes(char))
            const end = index
            tokens.push({
                type: QueryTokenType.Func, value,
                start, end
            })
            continue
        }

        throw state.error(`Unexpected char '${char}'.`, {
            start: index,
            end: index
        })
    }

    return tokens
}

const _error = (error: IQueryErrorCause) => new QueryError(error)

type IQueryContext = {
    query: string
}

type IQueryProcessState = {
    stage: IQueryProcessStage
    ctx: IQueryContext
    expect: (expectation: string | null, gotToken: IQueryToken | null) => QueryError
    error: (error: string, position: IPos) => QueryError
}

type IQueryParseState = IQueryProcessState & {
    tokens: IQueryToken[]
    index: number
    advance: () => number
    current: IQueryToken
}

type IQueryCompileState = IQueryProcessState & {
    cctxw: IQueryCalcCtxWrapper
}

const _newState = (ctx: IQueryContext, stage: IQueryProcessStage): IQueryProcessState => ({
    stage,
    ctx,
    expect: (expectation, gotToken) => _error({
        stage,
        query: ctx.query,
        error: (expectation === null ? 'Unexpected' : `Expect ${expectation}, but got`) + ` ${
            gotToken === null ? 'end of input' : `[${QueryTokenType[gotToken.type]}]`
        }.`,
        start: gotToken?.start ?? ctx.query.length,
        end: gotToken?.end
    }),
    error: (error, position) => _error({
        stage,
        query: ctx.query,
        error,
        start: position.start,
        end: position.end
    })
})

const _newTokenizeState = (ctx: IQueryContext) => (
    _newState(ctx, 'Tokenize')
)

const _newCompileState = (ctx: IQueryContext, cctxw: IQueryCalcCtxWrapper): IQueryCompileState => ({
    ..._newState(ctx, 'Compile'),
    cctxw
})

const _newParseState = (ctx: IQueryContext, tokens: IQueryToken[]) => {
    const state: IQueryParseState = {
        ..._newState(ctx, 'Parse'),
        tokens,
        index: 0,
        advance: () => ++ state.index,
        get current() {
            return state.tokens[state.index]
        }
    }
    return state
}

const enum ParseEndAt {
    EOI,
    RParen
}

const _getAstType = (ast: IQueryAst): IQueryDataType => {
    switch (ast.type) {
        case 'number':
            return { kind: 'basic', name: 'Number' }
        case 'string':
            return { kind: 'basic', name: 'String' }
        case 'call':
            return ast.sig.returnType
    }
} 

const _parse = (state: IQueryParseState, endAt: ParseEndAt, depth: number): IQueryAst | null => {
    const parseOne = (): IQueryAst | null => {
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
            const tree: IQueryAstString = {
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

        if (token.type === QueryTokenType.Number) {
            return {
                type: 'number',
                value: Number(token.value),
                start: token.start,
                end: token.end
            }
        }

        if (token.type === QueryTokenType.Func) {
            let funcName = token.value
            if (funcName in verbAliases) funcName = verbAliases[funcName]

            if (! _isFuncName(funcName)) throw state.error(`Unknown function '${funcName}'.`, token)
            const funcDef = funcDefs[funcName as IQueryFuncName]


            state.advance()
            const start = token.start

            const maybeHasParam = funcDef.sigs.some(sig => sig.parameters.length > 0)
            const args: IQueryAst[] = []
            if (maybeHasParam) while (true) {
                const arg = _parse(state, endAt, depth + 1)
                if (arg === null) break
                args.push(arg)
            }

            const end = state.current?.start ?? token.end
            const argTypes = args.map(_getAstType)

            const sig = funcDef.sigs.find(sig => {
                if (args.length !== sig.parameters.length) return false
                for (const [index, argType] of argTypes.entries()) {
                    if (! _isSameType(argType, sig.parameters[index])) return false
                }
                return true
            })

            if (! sig) throw state.error(
                `Arguments of type (${argTypes.map(_printTypeInBracket).join(' ')}) doesn't satisfy any signature of function '${funcName}':\n` +
                _printFuncSig(funcName, funcDef),
                { start, end }
            )

            return {
                type: 'call',
                funcName: funcName,
                args,
                sig,
                start,
                end
            }
        }

        throw state.expect(null, token)
    }

    return parseOne()
}

export type IQueryParseResult = {
    state: 'success'
    ast: IQueryAst
} | {
    state: 'null'
} | {
    state: 'error'
    error: QueryError
}

export const parse = (query: string): IQueryParseResult => {
    // Support old query
    if (! query.match(/[\s\(\)=!@#$%^&*'"`]/)) {
        query = `contains word '${query}'`
    }

    const ctx = { query }

    try {
        const tokens = _tokenize(_newTokenizeState(ctx))
        if (tokens === null) return { state: 'null' }

        const parseState = _newParseState(ctx, tokens)
        const ast = _parse(parseState, ParseEndAt.EOI, 0)
        if (ast === null) return { state: 'null' }

        if (ast.type !== 'call' || ast.sig.returnType.kind !== 'basic' || ast.sig.returnType.name !== 'Boolean') {
            throw parseState.error('The root expression is not a call returning a boolean.', ast)
        }

        return {
            state: 'success',
            ast
        }
    }
    catch (error) {
        console.error(error)
        return {
            state: 'error',
            error: error as QueryError
        }
    }
}

export const stringify = (ast: IQueryAst): string => {
    switch (ast.type) {
        case 'number':
            return String(ast.value)
        case 'string':
            return `'${ast.kana ?? ast.value}'`
        case 'call':
            return `(${[ ast.funcName, ...ast.args.map(stringify) ].join(' ')})`
    }
}

export type IQueryFilter = (word: IWord) => boolean

export type IQueryCalcCtx = {
    currentWord: IWord
}

export type IQueryCalcCtxWrapper = {
    ctx: IQueryCalcCtx
}

const _calc = (state: IQueryCompileState, ast: IQueryAst): string | number | IQueryFilter => {
    switch (ast.type) {
        case 'number':
            return ast.value
        case 'string':
            return ast.kana ?? ast.value
        case 'call':
            return ast.sig.body(state.cctxw.ctx, ...ast.args.map(arg => _calc(state, arg)))
    }
}

const _getCalcCtx = (word: IWord): IQueryCalcCtx => {
    return {
        currentWord: word
    }
}

export const compile = (ast: IQueryAst, query: string): IQueryFilter => {
    const cctxw: IQueryCalcCtxWrapper = { ctx: null as unknown as IQueryCalcCtx }
    const state = _newCompileState({ query }, cctxw)

    return (word: IWord) => {
        state.cctxw.ctx = _getCalcCtx(word)
        return _calc(state, ast) as unknown as boolean
    }
}
