import ts from 'typescript'
import minimist from 'minimist'
import { writeFile } from 'fs/promises'

const compressMagicCommentRegExp = /^\/\/\s*@compress\b([^]*)$/

const logHeaderLength = 12
const log = (header: string, fmt: string, ...p: any[]) => {
    console.log(`\x1B[1;32m${header.padStart(logHeaderLength)}\x1B[0m ${fmt}`, ...p)
}
const error = (header: string, fmt: string, ...p: any[]) => {
    console.error(`\x1B[1;31m${header.padStart(logHeaderLength)}\x1B[0m ${fmt}`, ...p)
    process.exit(1)
}

type CompressOption = { '@tag'?: string } & Record<string, string>

type PropMap = Record<string, {
    newName: string
    question: boolean
    typeNode: ts.Node
}>

type TypeToCompress = {
    kind: ts.TypeLiteralNode['kind']
    node: ts.TypeLiteralNode
    propMap: PropMap
} | {
    kind: ts.UnionTypeNode['kind']
    node: ts.UnionTypeNode
    tag: string
}

function compress(file: string, base: string): string {
    let program = ts.createProgram([ file ], {})
    const f = program.getSourceFile(file)

    const typeDefs: Record<string, TypeToCompress> = {}
    const codes = []
    const imports = new Set<string>()

    ts.forEachChild(f, node => {
        if (ts.isTypeAliasDeclaration(node)) {
            const text = node.getFullText(f).trim()
            const firstLine = text.split('\n')[0]
            const res = firstLine.match(compressMagicCommentRegExp)
            if (! res) return
            const compressOption: CompressOption = JSON.parse(res[1].trim() || '{}')

            let typeName: string
            const propMap: PropMap = {}

            node.forEachChild(node => {
                if (ts.isIdentifier(node)) {
                    typeName = node.getText(f)
                    log('Found', '%o with %o', typeName, compressOption)
                }

                else if (ts.isTypeLiteralNode(node)) {
                    const typeDef: TypeToCompress = { node, propMap, kind: node.kind }
                    typeDefs[typeName] = typeDef
                    imports.add(typeName)

                    node.forEachChild(node => {
                        if (ts.isPropertySignature(node)) {
                            const children = node.getChildren(f)
                            const propIdentifier = children[0]
                            const propType = children.at(- 1)
                            const question = ts.isQuestionToken(children[1])

                            if (! ts.isIdentifier(propIdentifier)) return

                            const propName = propIdentifier.getText(f)
                            const newName = compressOption[propName] ?? propName[0].toUpperCase()

                            const conflict = Object.entries(typeDef.propMap)
                                .find(([, def ]) => def.newName === newName)
                            if (conflict) {
                                error('Conflict', '%s <- %s & %s', newName, conflict[0], propName)
                            }

                            typeDef.propMap[propName] = {
                                newName,
                                question,
                                typeNode: propType
                            }
                        }
                    })
                }

                else if (ts.isUnionTypeNode(node)) {
                    const tag = compressOption['@tag']
                    if (! tag || typeof tag !== 'string') error('Syntax', '%o need @tag option', typeName)
                    else log('', 'union %o @tag %o', typeName, tag)

                    const typeDef: TypeToCompress = { node, tag, kind: node.kind }
                    typeDefs[typeName] = typeDef
                    imports.add(typeName)
                }
            })
        }
    })

    for (const typeName in typeDefs) {
        log('Generating', typeName)


        let compressTypes: string[] = []
        let typeCode = ''
        let serCode = ''
        let deserCode = ''

        const typeDef = typeDefs[typeName]

        if (typeDef.kind === ts.SyntaxKind.TypeLiteral) {
            let serInputs: string[] = []
            let deserInputs: string[] = []
            let serOutputs: string[] = []
            let deserOutputs: string[] = []

            for (const propName in typeDef.propMap) {
                const { newName, question, typeNode } = typeDef.propMap[propName]
                const typeText = typeNode.getText(f)
                const questionMark = question ? '?' : ''
                const refOutput = (de: boolean) => {
                    const name = de ? propName : newName
                    const inner = `compress_${typeText}.${de ? 'de' : ''}serialize(${name})`
                    return question ? `${name} ? ${inner} : undefined` : inner
                }

                log('Map', '%o%s: %s -> %o', propName, questionMark, typeText, newName)

                serInputs.push(`${propName}: ${newName}`)
                deserInputs.push(`${newName}: ${propName}`)
                
                if (ts.isTypeReferenceNode(typeNode)) {
                    imports.add(typeText.split('.')[0])
                    if (typeText in typeDefs) {
                        compressTypes.push(`${newName}${questionMark}: ${typeText}_Compress`)
                        serOutputs.push(`${newName}: ${refOutput(false)}`)
                        deserOutputs.push(`${propName}: ${refOutput(true)}`)
                        continue
                    }
                }

                if (ts.isArrayTypeNode(typeNode)) {
                    const eleTypeNode = typeNode.elementType
                    const eleTypeText = eleTypeNode.getText(f)
                    if (ts.isTypeReferenceNode(eleTypeNode)) {
                        imports.add(eleTypeText)
                        if (eleTypeText in typeDefs) {
                            compressTypes.push(`${newName}${questionMark}: ${eleTypeText}_Compress[]`)
                            serOutputs.push(`${newName}: ${newName}${questionMark}.map(compress_${eleTypeText}.serialize)`)
                            deserOutputs.push(`${propName}: ${propName}${questionMark}.map(compress_${eleTypeText}.deserialize)`)
                            continue
                        }
                    }
                }

                compressTypes.push(`${newName}${questionMark}: ${typeText}`)
                serOutputs.push(newName)
                deserOutputs.push(propName)
            }

            typeCode = `{${compressTypes.map(ln => '\n  ' + ln).join('')}\n}`
            serCode = `({ ${serInputs.join(', ')} }: ${typeName}): ${typeName}_Compress => ({${
                serOutputs.map(ln => '\n    ' + ln + ',').join('')
            }\n  })`
            deserCode = `({ ${deserInputs.join(', ')} }: ${typeName}_Compress): ${typeName} => ({${
                deserOutputs.map(ln => '\n    ' + ln + ',').join('')
            }\n  })`
        }

        else if (typeDef.kind === ts.SyntaxKind.UnionType) {
            let branches: { branchTypeText: string, tagTypeText: string }[] = []

            const tagName = typeDef.tag
            let newTagName: string

            typeDef.node.forEachChild(branch => {
                let branchIndex = 0
                if (ts.isTypeReferenceNode(branch)) {
                    const branchTypeText = branch.getText(f)
                    const branchTypeDef = typeDefs[branchTypeText]
                    
                    if (branchTypeDef.kind === ts.SyntaxKind.TypeLiteral) {
                        const tagProp = branchTypeDef.propMap[tagName]
                        if (newTagName === undefined) newTagName = tagProp.newName
                        else if (newTagName !== tagProp.newName) error('Conflict', 'union %o @tag %o -> %o & %o', typeName, tagName, newTagName, tagProp.newName)

                        const tagTypeText = tagProp.typeNode.getText(f)
                        branches.push({ branchTypeText, tagTypeText })
                    }

                    branchIndex ++
                }
            })

            typeCode = branches.map(branch => `${branch.branchTypeText}_Compress`).join(' | ')
            serCode = `(union: ${typeName}): ${typeName}_Compress => {${
                branches
                    .map(({ branchTypeText, tagTypeText }, index) =>
                        `\n    ${index ? 'else ' : ''}if (union.${tagName} === ${tagTypeText}) return compress_${branchTypeText}.serialize(union)`
                    )
                    .join('')
            }\n    else return undefined as never\n  }`
            deserCode = `(union: ${typeName}_Compress): ${typeName} => {${
                branches
                    .map(({ branchTypeText, tagTypeText }, index) =>
                        `\n    ${index ? 'else ' : ''}if (union.${newTagName} === ${tagTypeText}) return compress_${branchTypeText}.deserialize(union)`
                    )
                    .join('')
            }\n    else return undefined as never\n  }`
        }

        const code = `export type ${typeName}_Compress = ${typeCode}\n`
            + `export const compress_${typeName} = {\n`
            + `  serialize: ${serCode},\n`
            + `  deserialize: ${deserCode}\n`
            + `}\n`

        codes.push(code)
    }

    const importsCode = `import {\n`
        + [...imports].sort().map(ln => `  ${ln},`).join('\n')
        + `\n} from '${base}'\n`

    return importsCode + '\n'
        + codes.join('\n') + '\n'
}

const { input, base, output } = minimist(process.argv.slice(2), {
    alias: {
        input: 'i',
        output: 'o',
        base: 'b'
    }
})
const usage = 'usage: compress --input <input> --base <base> --output <output>'

if (! input || ! base || ! output) {
    console.error(usage)
    process.exit(1)
}

log('Reading', 'from %s', input)
const code = compress(input, base)

log('Writing', 'to %s', output)
await writeFile(output, code)

log('Finishing', '')
