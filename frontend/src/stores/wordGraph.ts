import { reactive, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import * as d3 from 'd3-force'

import { isSameTargetEdge, useWord } from '@store/words'

import { dedup, intersect } from '@util'

import type { IWord, IWordGraphEdge } from '@type'
import { mitt } from '@util/mitt'

export type INode = {
    word: IWord
}

export type IDragTargetInfo = {
    lastX: number
    lastY: number
    startX: number
    startY: number
}

export type ISimulationNode = INode & d3.SimulationNodeDatum & { type: 'node' } & Partial<IDragTargetInfo>

export type IView = {
    type: 'view'
} & Partial<IDragTargetInfo>

export type IDragTarget = ISimulationNode | IView

export type IEdge = {
    source: ISimulationNode
    target: ISimulationNode
    twoWay: boolean
}

export type IGraph = {
    centerNode: ISimulationNode
    nodes: ISimulationNode[]
    edges: IEdge[]

    simulation: ISimulation
    forceLink: d3.ForceLink<ISimulationNode, IEdge>

    updateKey: number
}

export type ISimulation = d3.Simulation<ISimulationNode, IEdge>

export const TICKS = 1000
export const ALPHA_MIN = 0.001

export const useWordGraph = defineStore('word-graph', () => {
    const wordStore = useWord()

    const graph = ref<IGraph>()

    const graphUpdateKey = ref(0)

    const initGraph = (word: IWord): IGraph => {
        const wordDict = wordStore.getWordDict()
        const visitedNodes: Record<number, boolean> = {}
        const nodes: ISimulationNode[] = reactive([])
        const edges: IEdge[] = reactive([])

        const visit = (now: IWord) => {
            const node: ISimulationNode = { type: 'node', word: now }
            nodes.push(node)
            visitedNodes[now.id] = true

            const { graph } = now
            if (! graph) return node

            const [ edgesInAndOut, edgesIn, edgesOut ] = intersect(
                dedup(graph.edgesIn, isSameTargetEdge),
                dedup(graph.edgesOut, isSameTargetEdge),
                isSameTargetEdge
            )
            
            const visitEdge = (direction: 'in' | 'out' | 'twoway') => ({ targetWord }: IWordGraphEdge) => {
                const nextNode = visitedNodes[targetWord]
                    ? nodes.find(node => node.word.id === targetWord)!
                    : visit(wordDict[targetWord])
                edges.push({
                    source: direction === 'in' ? nextNode : node,
                    target: direction === 'in' ? node : nextNode,
                    twoWay: direction === 'twoway'
                })
            }

            edgesIn.forEach(visitEdge('in'))
            edgesOut.forEach(visitEdge('out'))
            edgesInAndOut.forEach(visitEdge('twoway'))

            return node
        }
        
        const centerNode = visit(word)

        const forceLink = d3
            .forceLink<ISimulationNode, IEdge>(edges)
            .id(node => node.word.id)
            .distance(130)

        const simulation = d3
            .forceSimulation(nodes)
            .force('link', forceLink)
            .force('charge', d3.forceManyBody().strength(- 200))
            .stop()
            .alpha(1)
            .alphaMin(ALPHA_MIN)
            .alphaDecay(1 - Math.pow(ALPHA_MIN, 1 / TICKS))
            .restart()

        return {
            centerNode, nodes, edges,
            simulation, forceLink,
            updateKey: graphUpdateKey.value
        }
    }

    const useGraph = (word: IWord): IGraph => {
        // Return the current graph if the center word is contained in it
        if (graph.value && graph.value.updateKey === graphUpdateKey.value) {
            const centerNode = graph.value.nodes.find(node => node.word.id === word.id)
            if (centerNode) {
                graph.value.centerNode = centerNode
                return graph.value
            }
        }

        const newGraph = initGraph(word)
        graph.value = newGraph

        return newGraph
    }

    mitt.on('data:word:graph', ({ wordId }) => {
        if (wordId === '*' || graph.value?.nodes.some(node => node.word.id === wordId)) {
            graphUpdateKey.value ++
        }
    })

    return { useGraph, graphUpdateKey }
})
