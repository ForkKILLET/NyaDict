import { unreachable } from '@util'
import type {
    IQueryCalcCtx,
    IQueryDataType, IQueryFunc
} from '@util/filterQuery'

import { IncSub10, IntSub10 } from '@type/tool'

import { getWordMeanings, getWordSentences } from '@store/words'

const _basicTypeStrs = [ 'String', 'Boolean', 'Number' ] as const
const _genericTypeStrs = [ 'List', 'And', 'Or', 'Not' ] as const

export type IQueryDataBasicTypeStr = typeof _basicTypeStrs[number]
export type IQueryDataGenericTypeStr = typeof _genericTypeStrs[number]
export type IQueryDataNestedMaxDepth = 2
export type IQueryDataNestedTypeStr<Depth extends IntSub10 = 0, Inner extends string = IQueryDataBasicTypeStr> = Depth extends IQueryDataNestedMaxDepth
    ? never
    : `${IQueryDataGenericTypeStr}<${Inner}>` | IQueryDataNestedTypeStr<IncSub10<Depth>, `${IQueryDataGenericTypeStr}<${Inner}>`>
export type IQueryDataTypeStr = IQueryDataBasicTypeStr | IQueryDataNestedTypeStr

export type ParseQueryDataTypeStr<S extends IQueryDataTypeStr> =
    S extends `${infer Outer}<${infer Inner}>`
        ? Inner extends IQueryDataTypeStr
            ? { kind: 'nested', outer: Outer, inner: ParseQueryDataTypeStr<Inner> }
            : never
        : { kind: 'basic', name: S }

const _isBasicType = (typeStr: IQueryDataTypeStr): typeStr is IQueryDataBasicTypeStr => _basicTypeStrs.includes(typeStr as IQueryDataBasicTypeStr)

const _parseType = (typeStr: IQueryDataTypeStr): IQueryDataType => {
    if (_isBasicType(typeStr)) return {
        kind: 'basic',
        name: typeStr
    }
    const nestedRes = typeStr.match(/(?<outer>[a-zA-Z]+)<(?<inner>[a-zA-Z]+)>/)?.groups as {
        outer: IQueryDataGenericTypeStr
        inner: IQueryDataBasicTypeStr
    }
    if (nestedRes) return {
        kind: 'nested',
        outer: nestedRes.outer,
        inner: _parseType(nestedRes.inner)
    }

    throw unreachable()
}

const _newFunc = (sigs: [
    IQueryDataTypeStr[],
    IQueryDataTypeStr,
    (ctx: IQueryCalcCtx , ...args: any[]) => any
][]): IQueryFunc => ({
    sigs: sigs.map(([ parameters, returnType, body ]) => ({
        parameters: parameters.map(_parseType),
        returnType: _parseType(returnType),
        body
    }))
})

const _textMatchingFunc = (fn: (search: string) => (base: string) => boolean) => _newFunc([
    [ [ 'List<String>', 'String' ], 'Boolean', (_, bases: string[], search: string) => bases.some(fn(search)) ],
    [ [ 'String', 'String' ], 'Boolean', (_, base: string, search: string) => fn(search)(base)  ]
])

const _constFunc = (valueType: IQueryDataTypeStr, value: any) => _newFunc([
    [ [], valueType, () => value  ]
])

const _ctxConstFunc = (valueType: IQueryDataTypeStr, body: (ctx: IQueryCalcCtx) => any) => _newFunc([
    [ [], valueType, body ]
])

export const funcDefs = {
    equals: _textMatchingFunc(s => b => b === s),
    contains: _textMatchingFunc(s => b => b.includes(s)),
    startswith: _textMatchingFunc(s => b => b.startsWith(s)),
    endswith: _textMatchingFunc(s => b => b.endsWith(s)),

    empty: _newFunc([
        [ [ 'List<String>' ], 'Boolean', (_, strs: string[]) => ! strs.length ]
    ]),

    true: _constFunc('Boolean', true),
    false: _constFunc('Boolean', false),

    and: _newFunc([
        [ [ 'Boolean', 'Boolean' ], 'Boolean', (_, a: boolean, b: boolean) => a && b ],
        // [ [ 'List<String>', 'List<String>' ], 'And<List<String>>' ]
    ]),
    or: _newFunc([
        [ [ 'Boolean', 'Boolean' ], 'Boolean', (_, a: boolean, b: boolean) => a || b ],
        // [ [ 'List<String>', 'List<String>' ], 'Or<List<String>>' ]
    ]),
    not: _newFunc([
        [ [ 'Boolean' ], 'Boolean', (_, a: boolean) => ! a ],
        // [ [ 'List<String>' ], 'Not<List<String>>' ]
    ]),

    word: _ctxConstFunc('List<String>', (ctx): string[] => [
        ctx.currentWord.disp,
        ctx.currentWord.sub,
    ]),
    disp: _ctxConstFunc('List<String>', (ctx): string[] => [
        ctx.currentWord.disp,
    ]),
    sub: _ctxConstFunc('List<String>', (ctx): string[] => [
        ctx.currentWord.sub,
    ]),
    meaning: _ctxConstFunc('List<String>', (ctx): string[] => (
        getWordMeanings(ctx.currentWord)
    )),
    sentence: _ctxConstFunc('List<String>', (ctx): string[] => (
        getWordSentences(ctx.currentWord)
    )),
    doc: _ctxConstFunc('List<String>', (ctx): string[] => [
        ...getWordMeanings(ctx.currentWord),
        ...getWordSentences(ctx.currentWord)
    ])
} as const


export type IQueryFuncName = keyof typeof funcDefs
