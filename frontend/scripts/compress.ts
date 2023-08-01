import ts from 'typescript'
import dedent from 'dedent'
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

const tab2 = ' '.repeat(4)

type PropMap = Record<string, {
    newName: string
    question: boolean
    typeNode: ts.Node
}>

type TypeToCompress = {
    node: ts.TypeLiteralNode
    propMap: PropMap
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
            const compressOption: Record<string, string> = JSON.parse(res[1].trim() || '{}')

            let typeName: string
            const propMap: PropMap = {}

            node.forEachChild(node => {
                if (ts.isIdentifier(node)) {
                    typeName = node.getText(f)
                    log('Found', '%o with %o', typeName, compressOption)
                }

                if (ts.isTypeLiteralNode(node)) {
                    const typeDef: TypeToCompress = { node, propMap }
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
            })
        }
    })

    for (const typeName in typeDefs) {
        log('Generating', typeName)

        let serInputs = []
        let deserInputs = []
        let serOutputs = []
        let deserOutputs = []
        let compressTypes = [] 

        const typeDef = typeDefs[typeName]
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
                imports.add(typeText)
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

        const code = dedent`export type ${typeName}_Compress = {${compressTypes.map(ln => '\n          ' + ln).join('')}
        }
        export const compress_${typeName} = {
          serialize: ({ ${serInputs.join(', ')} }: ${typeName}) => ({${serOutputs.map(ln => '\n            ' + ln + ',').join('')}
          }),
          deserialize: ({ ${deserInputs.join(', ')} }: ${typeName}_Compress) => ({${deserOutputs.map(ln => '\n            ' + ln + ',').join('')}
          })
        }`

        codes.push(code)
    }

    return `import type { ${[...imports].join(', ')} } from '${base}'\n\n` + codes.join('\n')
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
