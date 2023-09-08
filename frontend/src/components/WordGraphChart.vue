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

type IDragTargetInfo = {
    lastX: number
    lastY: number
    startX: number
    startY: number
}

type ISimulationNode = INode & d3.SimulationNodeDatum & { type: 'node' } & Partial<IDragTargetInfo>

type IView = {
    type: 'view'
} & Partial<IDragTargetInfo>

type IDragTarget = ISimulationNode | IView

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

const TICKS = 1000
const ALPHA_MIN = 0.001

onMounted(() => {
    simulation
        .alpha(1)
        .alphaMin(ALPHA_MIN)
        .alphaDecay(1 - Math.pow(ALPHA_MIN, 1 / TICKS))
        .restart()
})

watch(graph, () => {
    simulation.nodes(graph.value.nodes)
    forceLink.links(graph.value.edges)
    simulation
        .alpha(0.3)
        .restart()
})

const dragTarget = ref<IDragTarget | null>(null)
const viewboxOffset = ref<{ dx: number, dy: number }>({ dx: 0, dy: 0 })

const onDragStart = (event: MouseEvent | TouchEvent, node?: ISimulationNode) => {
    let tar: IDragTarget

    const { clientX: x, clientY: y } = getEventPoint(event)
    const targetInfo: IDragTargetInfo = {
        startX: x, lastX: x,
        startY: y, lastY: y
    }
    if (node) {
        simulation.alphaTarget(0.3).restart()
        node.fx = node.x
        node.fy = node.y
        tar = Object.assign(node, targetInfo)
    }
    else {
        const { target } = event
        if (target instanceof Element && root.value?.contains(target)) {
            tar = Object.assign<IView, IDragTargetInfo>({
                type: 'view'
            }, targetInfo)
        }
        else return
    }

    dragTarget.value = tar
}

const onDragMove = (event: MouseEvent | TouchEvent) => {
    const tar = dragTarget.value
    if (! tar) return

    const { clientX: x, clientY: y } = getEventPoint(event)
    if (tar.type === 'node') {
        tar.fx! += x - tar.lastX!
        tar.fy! += y - tar.lastY!
    }
    else if (tar.type === 'view') {
        viewboxOffset.value.dx += tar.lastX! - x
        viewboxOffset.value.dy += tar.lastY! - y
    }
    tar.lastX = x
    tar.lastY = y
}

const router = useRouter()

const onDragEnd = (event: MouseEvent | TouchEvent) => {
    const tar = dragTarget.value
    if (! tar) return
    dragTarget.value = null

    if (tar.type === 'node') {
        const point = getEventPoint(event)
        simulation.alphaTarget(0)

        if (tar.startX === point.clientX && tar.startY === point.clientY) {
            // click event
            router.replace(`/words?id=${tar.word.id}`)
        }

        // cancel fixing
        delete tar.fx
        delete tar.fy
    }
}

const scale = ref(1)

const zoom = (deltaScale: number) => {
    const newScale = scale.value + deltaScale
    if (newScale <= 0 || newScale >= 2) return
    scale.value = newScale
}

useEventListener('mousedown', onDragStart)
useEventListener('touchstart', onDragStart)
useEventListener('mousemove', onDragMove)
useEventListener('touchmove', onDragMove)
useEventListener('mouseup', onDragEnd)
useEventListener('touchend', onDragEnd)
</script>

<template>
    <div ref="root" class="word-graph-chart" :class="{ dragging: !! dragTarget }">
        <div class="toolbar">
            <fa-icon @click="zoom(+ 0.1)" icon="magnifying-glass-plus" class="button" />
            <fa-icon @click="zoom(- 0.1)" icon="magnifying-glass-minus" class="button" />
        </div>
        <svg
            :width="width"
            :height="height"
            :viewBox="[- width / 2 + viewboxOffset.dx, - height / 2 + viewboxOffset.dy, width, height]
                .map(x => x / scale).join(' ')
            "
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
                    @mousedown.stop.prevent="event => onDragStart(event, node)"
                    @touchstart.stop.prevent="event => onDragStart(event, node)"
                    
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
.word-graph-chart {
    cursor: grab;
}
.word-graph-chart.dragging {
    cursor: grabbing;
}

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
