<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useElementSize, useEventListener } from '@vueuse/core'
import * as d3 from 'd3-force'

import { isSameTargetEdge, useWord } from '@store/words'

import { dedup, intersect } from '@util'
import { getEventPoint } from '@util/dom'

import EllipsisText from '@comp/charts/EllipsisText.vue'
import Arrow from '@comp/charts/Arrow.vue'

import type { IWord, IWordGraphEdge } from '@type'

const props = defineProps<{
    word: IWord
}>()

type INode = {
    word: IWord
}

type ISimulationNode = INode & d3.SimulationNodeDatum & {
    lastX?: number
    lastY?: number
    startX?: number
    startY?: number
}

type IDefiniteSimulationNode = {
    [K in keyof ISimulationNode]-?: Exclude<ISimulationNode[K], null>
}

type IEdge = {
    source: ISimulationNode
    target: ISimulationNode
    twoWay: boolean
}

const wordStore = useWord()

const graph = computed(() => {
    const wordDict = wordStore.getWordDict()
    const visitedNodes: Record<number, boolean> = {}
    const nodes: ISimulationNode[] = []
    const edges: IEdge[] = []

    const visit = (now: IWord) => {
        const node: ISimulationNode = { word: now }
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
    
    visit(props.word)

    return reactive({ nodes, edges })
})

// Following simulation code is from Koishi.
// See <https://github.com/koishijs/webui/blob/f88acd440be92216a6081bbd3b9172c824768de7/plugins/insight/client/index.vue>

const root = ref<HTMLDivElement>()
const { width, height } = useElementSize(root)

const forceLink = d3
    .forceLink<ISimulationNode, IEdge>(graph.value.edges)
    .id(node => node.word.id)
    .distance(130)

const simulation = d3
    .forceSimulation(graph.value.nodes)
    .force('link', forceLink)
    .force('charge', d3.forceManyBody().strength(- 200))
    .stop()

const ticks = 1000
const alphaMin = 0.001

onMounted(() => {
    simulation
        .alpha(1)
        .alphaMin(alphaMin)
        .alphaDecay(1 - Math.pow(alphaMin, 1 / ticks))
        .restart()
})

watch(graph, () => {
    simulation.nodes(graph.value.nodes)
    forceLink.links(graph.value.edges)
    simulation
        .alpha(0.3)
        .restart()
})

const draggingNode = ref<ISimulationNode | null>(null)

const onDragStart = (node: ISimulationNode, event: MouseEvent | TouchEvent) => {
    draggingNode.value = node

    simulation.alphaTarget(0.3).restart()
    const point = getEventPoint(event)
    node.startX = node.lastX = point.clientX
    node.startY = node.lastY = point.clientY
    node.fx = node.x
    node.fy = node.y
}

const onDragMove = (event: MouseEvent | TouchEvent) => {
    const node = draggingNode.value as IDefiniteSimulationNode | null
    if (! node) return
  
    const point = getEventPoint(event)
    node.fx += point.clientX - node.lastX
    node.fy += point.clientY - node.lastY
    node.lastX = point.clientX
    node.lastY = point.clientY
}

const router = useRouter()

const onDragEnd = (event: MouseEvent | TouchEvent) => {
    const point = getEventPoint(event)

    simulation.alphaTarget(0)
    const node = draggingNode.value
    if (! node) return

    node.fx = null
    node.fy = null
    draggingNode.value = null

    if (node.startX === point.clientX && node.startY === point.clientY) {
        router.replace(`/words?id=${node.word.id}`)
    }
}

useEventListener('mousemove', onDragMove)
useEventListener('touchmove', onDragMove)
useEventListener('mouseup', onDragEnd)
useEventListener('touchend', onDragEnd)
</script>

<template>
    <div ref="root" class="word-graph-chart">
        <svg
            :width="width"
            :height="height"
            :viewBox="`-${width / 2} -${height / 2} ${width} ${height}`"
        >
            <g class="links">
                <g
                    v-for="edge, index of graph.edges"
                    :key="index"
                    class="edge"
                >
                    <Arrow
                        :x1="edge.source.x"
                        :y1="edge.source.y"
                        :x2="edge.target.x"
                        :y2="edge.target.y"
                        :r="46"
                        :two-way="edge.twoWay"
                    />
                </g>
            </g>
            <g class="nodes">
                <g
                    v-for="node, index of graph.nodes"
                    :key="index"
                    class="node"
                    :class="{ center: node.word.id === word.id }"
                    @mousedown.stop.prevent="event => onDragStart(node, event)"
                    @touchstart.stop.prevent="event => onDragStart(node, event)"
                    
                >
                    <circle
                        :r="40"
                        :cx="node.x"
                        :cy="node.y"
                    />
                    <EllipsisText
                        :x="node.x"
                        :y="node.y"
                        :text="node.word.disp"
                        :max-length="70"
                    />
                </g>
            </g>
        </svg>
    </div>
</template>

<style scoped>
.node :deep(text) {
    text-anchor: middle;
    dominant-baseline: middle;
    stroke: none;
    fill: #fff;
    user-select: none;
    font-size: .8rem;
}

.node circle {
    stroke-width: 3;
    stroke: #eee;
    transition: .3s stroke;
}

.node.center circle {
    fill: var(--color-ui);
}

.node:hover circle {
    stroke: var(--color-ui);
}

.edge :deep(line) {
    stroke-width: 2;
    stroke: var(--color-fg);
}
</style>
