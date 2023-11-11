import type { IWord } from '@type'
import type { AllCharsInString } from '@type/tool'

import { notNullish } from '@util'

import { funcDefs, funcAliases, symbolPriority as symbolPrecedence } from './functions'
import type { INtDataBasicTypeStr, INtDataGenericTypeStr, INtFuncName, INtOperatorName } from './functions'

export type IPos = {
    start: number
    end: number
}

export type INtTextObject =
    | 'word' | 'disp' | 'sub'
    | 'meaning' | 'sentence'
export type INtTimeObject =
    | 'create' | 'test'

export enum NtTokenType {
    Function,
    Operator,
    String,
    Number,
    LParen,
    RParen,
}

export type INtToken = IPos & {
    raw: string
} & ({
    type: NtTokenType.Function,
    funcName: INtFuncName
} | {
    type: NtTokenType.Operator
    funcName: INtOperatorName
    precedence: number
} | {
    type: NtTokenType.Number
    value: number
} | {
    type: NtTokenType.String
    value: string
} | {
    type: NtTokenType.LParen
} | {
    type: NtTokenType.RParen
})

export type INtProcessStage = 'Tokenize' | 'Parse' | 'Postproc' | 'Compile'

export type INtErrorCause = {
    stage: INtProcessStage
    query: string
    error: string
    start: number
    end?: number
}

export class NtError extends Error {
    constructor(cause: INtErrorCause) {
        const spaceCount = cause.start
        const caretCount = cause.end === undefined ? 1 : cause.end - cause.start
        const message
            = `${cause.stage}Error`
            + `\n${cause.query.replace(/[^\u0020-\u007f]/g, '#')}\n` + ' '.repeat(spaceCount) + '^'.repeat(caretCount)
            + `\n${cause.error.replace(/^/gm, '  ')}`
        super(message, { cause })
    }
}

export interface NtError {
    cause: INtErrorCause
}

export type INtDataFunctionType = {
    kind: 'function'
    types: INtDataType[]
}

export type INtDataBasicType = {
    kind: 'basic'
    name: INtDataBasicTypeStr
}

export type INtDataNestedType = {
    kind: 'nested'
    outer: INtDataGenericTypeStr
    inner: INtDataType
}
export type INtDataType =
    | INtDataBasicType
    | INtDataNestedType
    | INtDataFunctionType

export type INtFuncSignature = {
    types: INtDataType[]
    body: (...p: any[]) => any
}

export type INtFunc = {
    sigs: INtFuncSignature[]
}

const _isFuncName = (name: string): name is INtFuncName => name in funcDefs || name in funcAliases
const _isOperatorName = (name: string): name is INtOperatorName => _isFuncName(name) && symbolChars.includes(name[0])
const _getFuncRealName = (name: INtFuncName): keyof typeof funcDefs => name in funcAliases
    ? funcAliases[name as keyof typeof funcAliases]
    : name as keyof typeof funcDefs

export const printType =  (type: INtDataType): string => {
    switch (type.kind) {
        case 'basic':
            return type.name
        case 'nested':
            return `${type.outer}<${printType(type.inner)}>`
        case 'function':
            return type.types.map(printType).join(' => ')
    }
}
export const printFuncName = (name: string) => symbolChars.includes(name[0]) ? `(${name})` : name
const _printFuncSig = (funcName: string, funcDef: INtFunc, highlightSigs: INtFuncSignature[] = []) => funcDef.sigs.map(sig =>
    (highlightSigs.includes(sig) ? '! ' : '- ') + `${printFuncName(funcName)} :: ${sig.types.map(printType).join(' => ')}`
).join('\n')

const _isSameType = (t: INtDataType, u: INtDataType) => {
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
const symbolChars = '-=<>~^$[]&|!#+*/.'
const numberChars = '0123456789'
const identifierChars
    = 'abcdefghijklmnopqrstuvwxyz'
    + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export type SymbolChars = AllCharsInString<typeof symbolChars>

const _tokenize = (state: INtProcessState): INtToken[] | null => {
    const tokens: INtToken[] = []
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
                type: NtTokenType.LParen,
                raw: '(', start: index, end: index + 1
            })
            index ++
            continue
        }

        if (char === ')') {
            tokens.push({
                type: NtTokenType.RParen,
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
                    type: NtTokenType.String, value,
                    raw, start, end
                })
            }
            else throw state.error('String not ended', {
                start,
                end: query.length
            })
            continue
        }

        if (numberChars.includes(char)) {
            const start = index
            let hasDot = false
            let raw = ''
            do {
                if (char === '.') hasDot = true
                raw += char
                char = query[++ index]
            }
            while (
                numberChars.includes(char) ||
                (! hasDot && char === '.' && numberChars.includes(query[index + 1]))
            )
            const end = index
            tokens.push({
                type: NtTokenType.Number,
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
            const precedence = symbolPrecedence[raw]
            tokens.push({
                type: NtTokenType.Operator,
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
                type: NtTokenType.Function,
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

const _error = (error: INtErrorCause) => new NtError(error)

type INtContext = {
    query: string
}

type INtProcessState = {
    stage: INtProcessStage
    ctx: INtContext
    expect: (expectation: string | null, gotToken: INtToken | null) => NtError
    error: (error: string, position: IPos) => NtError
}

type INtParseState = INtProcessState & {
    tokens: INtToken[]
    index: number
    advance: () => number
    next?: INtToken
    curr?: INtToken
}

type INtParseTier = {
    depth: number
    endAt: ParseEndAt
}

type INtPostprocState = INtProcessState & {}

type INtAstOpTmp = 
    | INtAstCallInfixTmp
    | INtAstOperatorInfixTmp

type INtAstOp = 
    | INtAstCallInfix
    | INtAstOperatorInfix

type INtAstPreTmp =
    | INtAstOpTmp
    | INtAstValue

type INtAstPre =
    | INtAstOp
    | INtAstValue

type INtAstCallInfixData = {
    type: 'call-infix'
    precedence: number
    token: IPos
}

type INtAstOperatorInfixData = {
    type: 'binop-infix'
    precedence: number
    token: INtToken & { type: NtTokenType.Operator }
}

type INtAstCallInfixTmp = INtAstCallInfixData & {
    lhs?: INtAstPreTmp
    rhs?: INtAstPreTmp
}
type INtAstCallInfix = INtAstCallInfixData & {
    lhs: INtAstPre
    rhs: INtAstPre
}
type INtAstOperatorInfixTmp = INtAstOperatorInfixData & {
    lhs?: INtAstPreTmp
    rhs?: INtAstPreTmp
}
type INtAstOperatorInfix = INtAstOperatorInfixData & {
    lhs: INtAstPre
    rhs: INtAstPre
}

type INtAstValue = {
    type: 'value'
    token: INtToken
}

export type INtAstPreCall = IPos & {
    type: 'call'
    funcName: INtFuncName
    args?: INtAst[]
    sig?: INtFuncSignature
}

export type INtAstPreFunction = IPos & {
    type: 'function'
    funcName: INtFuncName
    sig?: INtFuncSignature
}

export type INtAstString = IPos & {
    type: 'string'
    value: string
}

export type INtAstNumber = IPos & {
    type: 'number'
    value: number
}

export type INtAstCall = Required<INtAstPreCall>

export type INtAst =
    | INtAstCall
    | INtAstString
    | INtAstNumber

type INtCompileState = INtProcessState & {
    cctxw: INtCalcCtxWrapper
}

const _newState = (ctx: INtContext, stage: INtProcessStage): INtProcessState => ({
    stage,
    ctx,
    expect: (expectation, gotToken) => _error({
        stage,
        query: ctx.query,
        error: (expectation === null ? 'Unexpected' : `Expect ${expectation}, but got`) + ` ${
            gotToken === null ? 'end of input' : `[${NtTokenType[gotToken.type]} '${gotToken.raw}']`
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

const _newTokenizeState = (ctx: INtContext) => (
    _newState(ctx, 'Tokenize')
)

const _newParseState = (ctx: INtContext, tokens: INtToken[]) => {
    const state: INtParseState = {
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

const _newPostprocState = (ctx: INtContext): INtPostprocState => (
    _newState(ctx, 'Postproc')
)

const _newCompileState = (ctx: INtContext, cctxw: INtCalcCtxWrapper): INtCompileState => ({
    ..._newState(ctx, 'Compile'),
    cctxw
})

const enum ParseEndAt {
    EOI,
    RParen
}

type INtExprState = {
    root: INtAstPreTmp | undefined
    opStack: INtAstOpTmp[]
    addExpr: (expr: INtAstPreTmp) => void
    addOp: (op: INtAstOpTmp) => void
}

const _newExprState = (state: INtParseState): INtExprState => {
    const es: INtExprState = {
        root: undefined,
        opStack: [],
        addExpr: (expr) => {
            const { root, opStack } = es
            const top = opStack.at(- 1)
            if (top && ! top.rhs) {
                top.rhs = expr
            }
            else if (! root) {
                es.root = expr
            }
            else {
                es.addOp({
                    type: 'call-infix',
                    token: {
                        start: root.token.start,
                        end: root.token.end
                    },
                    precedence: Infinity
                })
                es.addExpr(expr)
            }
        },
        addOp: (op) => {
            const { opStack } = es

            let top: INtAstOpTmp | undefined = undefined
            let toReduce = false
            while (opStack.length) {
                top = opStack.at(- 1)!
                if (top.type === 'binop-infix' && ! top.rhs) {
                    throw state.expect(`RHS of Operator '${top.token.funcName}'`, (op as INtAstOperatorInfixTmp).token)
                }
                if (top.precedence < op.precedence) { // precedence of `now` is **lower** than `op`
                    toReduce = true
                    break
                }
                opStack.pop()
            }
            if (toReduce && top) {
                op.lhs = top.rhs
                top.rhs = op
            }
            else {
                op.lhs = es.root
                es.root = op
            }

            opStack.push(op)
        }
    }
    return es
}

const _parse = (state: INtParseState, tier: INtParseTier): INtAstPre => {
    const { advance, expect, error } = state
    const es = _newExprState(state)

    scan: while (true) {
        const token = state.curr

        if (token === undefined) {
            if (tier.endAt === ParseEndAt.EOI) break
            else throw expect('[RParen]', null)
        }

        switch (token.type) {
            case NtTokenType.Number:
            case NtTokenType.String:
            case NtTokenType.Function: {
                es.addExpr({
                    type: 'value',
                    token
                })
                break
            }
            case NtTokenType.Operator:
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
            case NtTokenType.LParen:
                advance()
                const expr = _parse(state, {
                    depth: tier.depth + 1,
                    endAt: ParseEndAt.RParen
                })
                es.addExpr(expr)
                break
            case NtTokenType.RParen:
                if (tier.endAt === ParseEndAt.RParen) {
                    if (! es.root) throw expect('expression', token)
                    break scan
                }
                throw expect(null, token)
            default:
                throw state.expect(null, token)
        }

        advance()
    }

    if (! es.root) throw expect('expression', null)

    const top = es.opStack.at(- 1)
    if (top?.type === 'binop-infix' && ! top.rhs) {
        throw error(`Operator '${top.token.funcName}' doesn't have RHS.`, top.token)
    }

    return es.root as INtAstPre
}

const _getAstType = (ast: INtAst): INtDataType => {
    switch (ast.type) {
        case 'number':
            return { kind: 'basic', name: 'Number' }
        case 'string':
            return { kind: 'basic', name: 'String' }
        case 'call':
            return ast.sig.types.at(- 1)!
    }
} 

const _inferFunction = (
    state: INtPostprocState,
    func: INtAstPreFunction,
): INtAst => {
    const { funcName, start, end } = func

    return _inferCall(state, [], {
        type: 'call',
        funcName,
        start,
        end
    })
}

const _inferCall = (
    state: INtPostprocState,
    args: INtAst[],
    preCall: INtAstPreCall,
    // constraints: INtTypeConstraint[]
): INtAstCall => {
    const { funcName } = preCall
    const realName = _getFuncRealName(funcName)
    const funcDef = funcDefs[realName]

    const possibleSigs = funcDef.sigs

    const argTypes = args.map(_getAstType)

    const satisfyingSigs = possibleSigs
        .map(sig => {
            const paramTypes = sig.types.slice(0, - 1)
            if (paramTypes.length !== args.length) return null
            if (paramTypes.some((paramType, index) => ! _isSameType(paramType, argTypes[index]))) return null
            return { sig, args }
        })
        .filter(notNullish)

    if (! satisfyingSigs.length) {
        throw state.error(
            `Arguments (${ argTypes.map(printType).join(' ') }) doesn't satisfy any signature of function '${funcName}':\n` +
            _printFuncSig(funcName, funcDef),
            preCall
        )
    }
    if (satisfyingSigs.length > 1) {
        throw state.error(
            `Arguments (${ argTypes.map(printType).join(' ') }) satisfy multiple signatures of function '${funcName}':\n` +
            _printFuncSig(funcName, funcDef, satisfyingSigs.map(({ sig }) => sig)),
            preCall
        )
    }

    return {
        ...preCall,
        ...satisfyingSigs[0]
    }
}

type INtTypeConstraint = {
    kind: 'is'
    type: INtDataType
} | {
    kind: 'func-head'
    type: INtDataType
} | {
    kind: 'func-tail'
    type: INtDataType[]
}

const _checkConstraint = (constraint: INtTypeConstraint, object: INtDataType): boolean => {
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

const _postproc = (
    state: INtPostprocState,
    preAst: INtAstPre,
): INtAst => {
    let resAst: INtAst

    switch (preAst.type) {
        case 'value': {
            const { token } = preAst
            if (token.type === NtTokenType.Number) {
                resAst = {
                    type: 'number',
                    value: token.value,
                    start: token.start,
                    end: token.end
                }
            }
            else if (token.type === NtTokenType.String) {
                resAst = {
                    type: 'string',
                    value: token.value,
                    start: token.start,
                    end: token.end
                }
            }
            else if (token.type === NtTokenType.Function || token.type === NtTokenType.Operator) {
                resAst = _inferFunction(state, {
                    type: 'function',
                    funcName: token.funcName,
                    start: token.start,
                    end: token.end
                })
            }
            else throw state.expect(null, token)
            break
        }
        case 'binop-infix': {
            const lhs = _postproc(state, preAst.lhs)
            const rhs = _postproc(state, preAst.rhs)

            resAst = _inferCall(state, [ lhs, rhs ], {
                type: 'call',
                funcName: preAst.token.funcName,
                start: lhs.start,
                end: rhs.end
            })
            break
        }
        case 'call-infix': {
            const preArgs: INtAstPre[] = []
            let func = preAst
            while (true) {
                if (func.rhs) preArgs.unshift(func.rhs)
                if (func.lhs.type !== 'call-infix') break
                func = func.lhs
            }

            if (func.lhs.type !== 'value' ||
                func.lhs.token.type !== NtTokenType.Function &&
                func.lhs.token.type !== NtTokenType.Operator
            ) {
                throw state.error('Recently only function identifiers can be called.', preAst.token)
            }

            const funcToken = func.lhs.token
            const args = preArgs.map(preArg => _postproc(state, preArg))

            resAst = _inferCall(state, args, {
                type: 'call',
                funcName: funcToken.funcName,
                start: funcToken.start,
                end: (args.at(- 1) ?? funcToken).end
            })
            break
        }
    }

    if (! resAst) throw state.expect('expression', null)
    return resAst
}

export type INtParseResult = {
    state: 'success'
    ast: INtAst
} | {
    state: 'null'
} | {
    state: 'error'
    error: NtError
}

export const escapeStr = (value: string) => `'${value.replaceAll('\\', '\\\\').replaceAll('\'', '\\\'')}'`

export const parse = (query: string, options: {
    advanced: boolean
    isBoolean: boolean
}): INtParseResult => {
    if (! options.advanced) query = `text -> ${escapeStr(query)} | text -> (kana ${escapeStr(query)})`

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

        const ast = _postproc(_newPostprocState(ctx), preAst)

        console.log(ast)
        console.log(stringify(ast))

        const rootType = _getAstType(ast)
        if (options.isBoolean && (rootType.kind !== 'basic' || rootType.name !== 'Boolean')) {
            throw parseState.error(`The root expression should be Boolean, but got ${printType(rootType)}.`, ast)
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
            error: error as NtError
        }
    }
}

export const stringify = (ast: INtAst): string => {
    switch (ast.type) {
        case 'number':
            return String(ast.value)
        case 'string':
            return escapeStr(ast.value)
        case 'call':
            return ast.args.length
                ? `(${[ ast.funcName, ...ast.args.map(stringify) ].join(' ')})`
                : ast.funcName
    }
}

export type INtFilter = (word: IWord) => boolean

export type INtCalcCtx = {
    currentWord: IWord
}

export type INtCalcCtxWrapper = {
    ctx: INtCalcCtx
}

const _calc = (state: INtCompileState, ast: INtAst): string | number | INtFilter => {
    switch (ast.type) {
        case 'number':
        case 'string':
            return ast.value
        case 'call':
            return ast.sig.body(state.cctxw.ctx, ...ast.args.map(arg => _calc(state, arg)))
    }
}

const _getCalcCtx = (word: IWord): INtCalcCtx => {
    return {
        currentWord: word
    }
}

export const compile = (ast: INtAst, query: string): INtFilter => {
    const cctxw: INtCalcCtxWrapper = { ctx: null as unknown as INtCalcCtx }
    const state = _newCompileState({ query }, cctxw)

    return (word: IWord) => {
        state.cctxw.ctx = _getCalcCtx(word)
        return _calc(state, ast) as unknown as boolean
    }
}
