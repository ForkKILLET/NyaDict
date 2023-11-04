import { notNullish } from '@vueuse/core'

import type { IWord } from '@type'
import type { AllCharsInString } from '@type/tool'

import { unreachable } from '@util'
import { funcDefs, funcAliases, symbolPriority } from '@util/filterQuery/functions'
import type { IQueryDataBasicTypeStr, IQueryDataGenericTypeStr, IQueryFuncName, IQueryOperatorName } from '@util/filterQuery/functions'

export type IPos = {
    start: number
    end: number
}

export type IQueryTextObject =
    | 'word' | 'disp' | 'sub'
    | 'meaning' | 'sentence'
export type IQueryTimeObject =
    | 'create' | 'test'

export enum QueryTokenType {
    Function,
    Operator,
    String,
    Number,
    LParen,
    RParen,
}

export type IQueryToken = IPos & {
    raw: string
} & ({
    type: QueryTokenType.Function,
    funcName: IQueryFuncName
} | {
    type: QueryTokenType.Operator
    funcName: IQueryOperatorName
    precedence: number
} | {
    type: QueryTokenType.Number
    value: number
} | {
    type: QueryTokenType.String
    value: string
} | {
    type: QueryTokenType.LParen
} | {
    type: QueryTokenType.RParen
})

export type IQueryProcessStage = 'Tokenize' | 'Parse' | 'Postproc' | 'Compile'

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

export type IQueryDataFunctionType = {
    kind: 'function'
    types: IQueryDataType[]
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
export type IQueryDataType =
    | IQueryDataBasicType
    | IQueryDataNestedType
    | IQueryDataFunctionType

export type IQueryFuncSignature = {
    types: IQueryDataType[]
    body: (...p: any[]) => any
}

export type IQueryFunc = {
    sigs: IQueryFuncSignature[]
}

const _isFuncName = (name: string): name is IQueryFuncName => name in funcDefs || name in funcAliases
const _isOperatorName = (name: string): name is IQueryOperatorName => _isFuncName(name) && symbolChars.includes(name[0])
const _getFuncRealName = (name: IQueryFuncName): keyof typeof funcDefs => name in funcAliases
    ? funcAliases[name as keyof typeof funcAliases]
    : name as keyof typeof funcDefs

const _printType =  (type: IQueryDataType): string => {
    switch (type.kind) {
        case 'basic':
            return type.name
        case 'nested':
            return `${type.outer}<${_printType(type.inner)}>`
        case 'function':
            return type.types.map(_printType).join(' => ')
    }
}
const _printTypeInBracket = (type: IQueryDataType) => `<${_printType(type)}>`
const _printFuncName = (name: string) => symbolChars.includes(name[0]) ? `(${name})` : name
const _printFuncSig = (funcName: string, funcDef: IQueryFunc, highlightSigs: IQueryFuncSignature[] = []) => funcDef.sigs.map(sig =>
    (highlightSigs.includes(sig) ? '! ' : '- ') + `${_printFuncName(funcName)} :: ${sig.types.map(_printType).join(' => ')}`
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

const whiteChars = ' \t\r\n\u3000'
const symbolChars = '-=<>~^$[]&|!#+*/'
const identifierChars
    = 'abcdefghijklmnopqrstuvwxyz'
    + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    + '0123456789'

export type SymbolChars = AllCharsInString<typeof symbolChars>

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
                type: QueryTokenType.LParen,
                raw: '(', start: index, end: index + 1
            })
            index ++
            continue
        }

        if (char === ')') {
            tokens.push({
                type: QueryTokenType.RParen,
                raw: ')', start: index, end: index + 1
            })
            index ++
            continue
        }

        if (char === '\'' || char === '"') {
            const quote = char
            const start = index
            let raw = quote, value = '', escaping = false
            char = query[++ index]
            while (index < query.length) {
                raw += char
                if (escaping) {
                    escaping = false
                    if (char === 'n') value += '\n'
                    else value += char
                }
                else if (char === quote) {
                    break
                }
                else if (char === '\\') {
                    escaping = true
                }
                else {
                    value += char
                }
                char = query[++ index]
            }
            if (char === quote) {
                const end = ++ index
                tokens.push({
                    type: QueryTokenType.String, value,
                    raw, start, end
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
            let raw = ''
            do {
                if (char === '.') hasDot = true
                raw += char
                char = query[++ index]
            }
            while (/\d/.test(char) || (! hasDot && char === '.'))
            const end = index
            tokens.push({
                type: QueryTokenType.Number,
                value: Number(raw),
                raw, start, end
            })
            continue
        }

        if (symbolChars.includes(char)) {
            const start = index
            let raw = ''
            do {
                raw += char
                char = query[++ index]
            }
            while (symbolChars.includes(char))
            const end = index
            if (! _isOperatorName(raw)) {
                throw state.error(`Unknown operator '${raw}'.`, { start, end })
            }
            const precedence = symbolPriority[raw]
            tokens.push({
                type: QueryTokenType.Operator,
                funcName: raw,
                precedence,
                raw, start, end
            })
            continue
        }

        if (identifierChars.includes(char)) { // TODO: dup
            const start = index
            let raw = ''
            do {
                raw += char
                char = query[++ index]
            }
            while (identifierChars.includes(char))
            const end = index
            if (! _isFuncName(raw)) {
                throw state.error(`Unknown function '${raw}'.`, { start, end })
            }
            tokens.push({
                type: QueryTokenType.Function,
                funcName: raw,
                raw, start, end
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
    next?: IQueryToken
    curr?: IQueryToken
}

type IQueryParseTier = {
    depth: number
    endAt: ParseEndAt
}

type IQueryPostprocState = IQueryProcessState & {}

type IQueryAstOpTmp = 
    | IQueryAstCallInfixTmp
    | IQueryAstOperatorInfixTmp

type IQueryAstOp = 
    | IQueryAstCallInfix
    | IQueryAstOperatorInfix

type IQueryAstPreTmp =
    | IQueryAstOpTmp
    | IQueryAstValue

type IQueryAstPre =
    | IQueryAstOp
    | IQueryAstValue

type IQueryAstCallInfixData = {
    type: 'call-infix'
    token: IPos
}

type IQueryAstOperatorInfixData = {
    type: 'binop-infix'
    precedence: number
    token: IQueryToken & { type: QueryTokenType.Operator }
}

type IQueryAstCallInfixTmp = IQueryAstCallInfixData & {
    lhs?: IQueryAstPreTmp
    rhs?: IQueryAstPreTmp
}
type IQueryAstCallInfix = IQueryAstCallInfixData & {
    lhs: IQueryAstPre
    rhs: IQueryAstPre
}
type IQueryAstOperatorInfixTmp = IQueryAstOperatorInfixData & {
    lhs?: IQueryAstPreTmp
    rhs?: IQueryAstPreTmp
}
type IQueryAstOperatorInfix = IQueryAstOperatorInfixData & {
    lhs: IQueryAstPre
    rhs: IQueryAstPre
}

type IQueryAstValue = {
    type: 'value'
    token: IQueryToken
}

export type IQueryAstPreCall = IPos & {
    type: 'call'
    funcName: IQueryFuncName
    args?: IQueryAst[]
    sig?: IQueryFuncSignature
}

export type IQueryAstPreFunction = IPos & {
    type: 'function'
    funcName: IQueryFuncName
    sig?: IQueryFuncSignature
}

export type IQueryAstString = IPos & {
    type: 'string'
    value: string
}

export type IQueryAstNumber = IPos & {
    type: 'number'
    value: number
}

export type IQueryAstCall = Required<IQueryAstPreCall>
export type IQueryAstFunction = Required<IQueryAstPreFunction>

export type IQueryAst =
    | IQueryAstCall
    | IQueryAstString
    | IQueryAstNumber
    | IQueryAstFunction

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
            gotToken === null ? 'end of input' : `[${QueryTokenType[gotToken.type]} '${gotToken.raw}']`
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

const _newParseState = (ctx: IQueryContext, tokens: IQueryToken[]) => {
    const state: IQueryParseState = {
        ..._newState(ctx, 'Parse'),
        tokens,
        index: 0,
        advance: () => ++ state.index,
        get curr() {
            return state.tokens[state.index]
        },
        get next() {
            return state.tokens[state.index + 1]
        }
    }
    return state
}

const _newPostprocState = (ctx: IQueryContext): IQueryPostprocState => (
    _newState(ctx, 'Postproc')
)

const _newCompileState = (ctx: IQueryContext, cctxw: IQueryCalcCtxWrapper): IQueryCompileState => ({
    ..._newState(ctx, 'Compile'),
    cctxw
})

const enum ParseEndAt {
    EOI,
    RParen
}

type IQueryExprState = {
    root: IQueryAstPreTmp | undefined
    top: IQueryAstOperatorInfixTmp | undefined
    addExpr: (expr: IQueryAstPreTmp) => void
    addOp: (op: IQueryAstOperatorInfixTmp) => void
}

const _newExprState = (state: IQueryParseState): IQueryExprState => {
    const es: IQueryExprState = {
        root: undefined,
        top: undefined, // TODO: should be a stack: a + f b * c
        addExpr: (expr) => {
            const { root, top } = es
            if (top) {
                if (! top.rhs) {
                    top.rhs = expr
                    return
                }
                top.rhs = {
                    type: 'call-infix',
                    token: {
                        start: top.token.start,
                        end: top.token.end
                    },
                    lhs: top.rhs,
                    rhs: expr
                }
            }
            else if (! root) {
                es.root = expr
            }
            else {
                es.root = {
                    type: 'call-infix',
                    token: {
                        start: root.token.start,
                        end: root.token.end
                    },
                    lhs: root,
                    rhs: expr
                }
            }
        },
        addOp: (op) => {
            const { top } = es
            es.top = op

            if (top) {
                if (! top.rhs) throw state.expect('RHS', op.token)

                let now = top
                let opToReduce: IQueryAstOpTmp | undefined = undefined
                while (true) {
                    if (now.precedence < op.precedence) { // precedence of `now` is **lower** than `op`
                        opToReduce = now
                        break
                    }
                    if (now.lhs?.type !== 'binop-infix') break
                    now = now.lhs
                }
                if (opToReduce) {
                    op.lhs = opToReduce.rhs
                    opToReduce.rhs = op
                    return
                }
            }

            op.lhs = es.root
            es.root = op
        }
    }
    return es
}

const _parse = (state: IQueryParseState, tier: IQueryParseTier): IQueryAstPre => {
    const { advance, expect, error } = state
    const es = _newExprState(state)

    scan: while (true) {
        const token = state.curr

        if (token === undefined) {
            if (tier.endAt === ParseEndAt.EOI) break
            else throw expect('[RParen]', null)
        }

        switch (token.type) {
            case QueryTokenType.Number:
            case QueryTokenType.String:
            case QueryTokenType.Function: {
                es.addExpr({
                    type: 'value',
                    token
                })
                break
            }
            case QueryTokenType.Operator:
                if (es.root) {
                    es.addOp({
                        type: 'binop-infix',
                        token,
                        precedence: token.precedence
                    })
                }
                else {
                    es.addExpr({
                        type: 'value',
                        token
                    })
                }
                break
            case QueryTokenType.LParen:
                advance()
                const expr = _parse(state, {
                    depth: tier.depth + 1,
                    endAt: ParseEndAt.RParen
                })
                es.addExpr(expr)
                break
            case QueryTokenType.RParen:
                if (tier.endAt === ParseEndAt.RParen) {
                    break scan
                }
                throw expect(null, token)
            default:
                throw state.expect(null, token)
        }

        advance()
    }

    const root = es.root
    if (! root) throw expect('expression', null)

    const top = es.top
    if (top && ! top.rhs) {
        throw error(`Operator '${top.token.funcName}' doesn't have RHS.`, top.token)
    }

    return root as IQueryAstPre
}

const _getAstType = (ast: IQueryAst): IQueryDataType => {
    switch (ast.type) {
        case 'number':
            return { kind: 'basic', name: 'Number' }
        case 'string':
            return { kind: 'basic', name: 'String' }
        case 'function':
            if (ast.sig.types.length > 1) return { kind: 'function', types: ast.sig.types }
            return ast.sig.types[0]
        case 'call':
            return ast.sig.types.at(- 1)!
    }
} 

const _inferFunction = (
    state: IQueryPostprocState,
    func: IQueryAstPreFunction,
    _constraints: IQueryTypeConstraint[]
): IQueryAst | null => {
    const { funcName, start, end } = func
    const realName = _getFuncRealName(funcName)
    const funcDef = funcDefs[realName]

    // TODO
    if (funcDef.sigs.length > 1) throw state.error('Recently we cannot infer the type of an overloaded function which is not directly called.', func)

    const [ sig ] = funcDef.sigs
    const call: IQueryAstCall = {
        type: 'call',
        funcName,
        args: [],
        sig,
        start,
        end
    }

    return call
}

const _inferCall = (
    state: IQueryPostprocState,
    preArgs: IQueryAstPre[],
    call: IQueryAstPreCall,
    constraints: IQueryTypeConstraint[]
): IQueryAstCall | null => {
    const { funcName } = call
    const realName = _getFuncRealName(funcName)
    const funcDef = funcDefs[realName]

    let possibleSigs: IQueryFuncSignature[]
    if (constraints.length) {
        possibleSigs = funcDef.sigs.filter(sig => {
            const ret = sig.types.at(- 1)!
            return constraints.every(c => _checkConstraint(c, ret))
        })
    }
    else {
        possibleSigs = funcDef.sigs
    }

    const satisfyingSigs = possibleSigs
        .map(sig => {
            const parameters = sig.types.slice(0, - 1)
            if (parameters.length !== preArgs.length) return null
            const args: IQueryAst[] = []
            for (const [ index, paramType ] of parameters.entries()) {
                const constraints: IQueryTypeConstraint[] = [
                    { kind: 'is', type: paramType }
                ]
                const preArg = preArgs[index]
                const arg = _postproc(state, preArg, constraints)
                if (arg === null) return null
                args.push(arg)
            }
            return { sig, args }
        })
        .filter(notNullish)

    if (! satisfyingSigs.length) {
        // if (constraints.length) return null
        throw state.error(
            `Arguments doesn't satisfy any signature of function '${funcName}':\n` +
            _printFuncSig(funcName, funcDef),
            call
        )
    }
    if (satisfyingSigs.length > 1) {
        // if (constraints.length) return null
        throw state.error(
            `Arguments satisfy multiple signatures of function '${funcName}':\n` +
            _printFuncSig(funcName, funcDef, satisfyingSigs.map(({ sig }) => sig)),
            call
        )
    }

    const [ { args, sig } ] = satisfyingSigs

    return Object.assign(call, { args, sig })
}

type IQueryTypeConstraint = {
    kind: 'is'
    type: IQueryDataType
} | {
    kind: 'func-head'
    type: IQueryDataType
} | {
    kind: 'func-tail'
    type: IQueryDataType[]
}

const _checkConstraint = (constraint: IQueryTypeConstraint, object: IQueryDataType): boolean => {
    const { type, kind } = constraint
    switch (kind) {
        case 'is':
            return _isSameType(type, object)
        case 'func-head':
            return object.kind === 'function' && _isSameType(object.types[0], type)
        case 'func-tail':
            if (object.kind !== 'function') return false
            const tail = object.types.slice(1)
            if (type.length !== tail.length) return false
            return tail.every((t, i) => _isSameType(t, type[i]))
    }
}

const _postproc = <C extends IQueryTypeConstraint[] | [] = []>(
    state: IQueryPostprocState,
    preAst: IQueryAstPre,
    constraints: C
): IQueryAst | (C extends { length: 0 } ? never : null) => {
    type ResAst = IQueryAst | (C extends { length: 0 } ? never : null)

    let maybeAst: IQueryAst | null = null

    switch (preAst.type) {
        case 'value': {
            const { token } = preAst
            if (token.type === QueryTokenType.Number) {
                maybeAst = {
                    type: 'number',
                    value: token.value,
                    start: token.start,
                    end: token.end
                }
            }
            else if (token.type === QueryTokenType.String) {
                maybeAst = {
                    type: 'string',
                    value: token.value,
                    start: token.start,
                    end: token.end
                }
            }
            else if (token.type === QueryTokenType.Function || token.type === QueryTokenType.Operator) {
                maybeAst = _inferFunction(state, {
                    type: 'function',
                    funcName: token.funcName,
                    start: token.start,
                    end: token.end
                }, constraints)
            }
            else throw state.expect(null, token)
            break
        }
        case 'binop-infix': {
            const { lhs, rhs } = preAst

            maybeAst = _inferCall(state, [ lhs, rhs ], {
                type: 'call',
                funcName: preAst.token.funcName,
                start: lhs.token.start,
                end: rhs.token.end
            }, constraints)
            break
        }
        case 'call-infix': {
            const args: IQueryAstPre[] = []
            let func = preAst
            while (true) {
                if (func.rhs) args.unshift(func.rhs)
                if (func.lhs.type !== 'call-infix') break
                func = func.lhs
            }

            if (func.lhs.type !== 'value' ||
                func.lhs.token.type !== QueryTokenType.Function &&
                func.lhs.token.type !== QueryTokenType.Operator
            ) {
                throw state.error('Recently only function identifiers can be called.', func.token)
            }

            const funcToken = func.lhs.token

            maybeAst = _inferCall(state, args, {
                type: 'call',
                funcName: funcToken.funcName,
                start: funcToken.start,
                end: (args.at(- 1)?.token ?? funcToken).end
            }, constraints)
            break
        }
    }

    if (! maybeAst) throw state.expect('expression', null)

    const resAst = maybeAst

    if (constraints) {
        if (constraints.some(c => ! _checkConstraint(c, _getAstType(resAst)))) {
            return null as ResAst
        }
    }

    return resAst
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

const _escapeStr = (value: string) => `'${value.replaceAll('\\', '\\\\').replaceAll('\'', '\\\'')}'`

export const parse = (query: string, advanced: boolean): IQueryParseResult => {
    if (! advanced) query = `contains word ${_escapeStr(query)}`

    const ctx = { query }

    try {
        const tokens = _tokenize(_newTokenizeState(ctx))
        if (tokens === null) return { state: 'null' }

        const parseState = _newParseState(ctx, tokens)
        const preAst = _parse(parseState, {
            endAt: ParseEndAt.EOI,
            depth: 0
        })
        if (preAst === null) return { state: 'null' }

        console.log(preAst)

        const ast = _postproc(_newPostprocState(ctx), preAst, [])

        console.log(ast)
        console.log(stringify(ast))

        const rootType = _getAstType(ast)
        if (rootType.kind !== 'basic' || rootType.name !== 'Boolean') {
            throw parseState.error(`The root expression should be <Boolean>, but got ${_printTypeInBracket(rootType)}.`, ast)
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
        case 'function':
            return ast.funcName
        case 'string':
            return _escapeStr(ast.value)
        case 'call':
            return ast.args.length
                ? `(${[ ast.funcName, ...ast.args.map(stringify) ].join(' ')})`
                : ast.funcName
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
        case 'string':
            return ast.value
        case 'function':
            throw unreachable() // TODO
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
