<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useElementSize, useEventListener } from '@vueuse/core'

import { IDragTarget, IDragTargetInfo, ISimulationNode, IView, useWordGraph } from '@store/wordGraph'

import { getEventPoint } from '@util/dom'
import { depRef } from '@util/reactivity'
import { storeRef } from '@util/storage'
import { disposeShortcuts, newKey, registerShortcuts } from '@util/keyboard'

import EllipsisText from '@comp/charts/EllipsisText.vue'
import Arrow from '@comp/charts/Arrow.vue'

import type { IWord } from '@type'

const props = defineProps<{
    word: IWord
}>()

const wordGraphStore = useWordGraph()

// TODO: perf

const graph = depRef(
    () => wordGraphStore.useGraph(props.word),
    [ props, storeToRefs(wordGraphStore).graphUpdateKey ]
)

// Simulation code is from Koishi.
// See <https://github.com/koishijs/webui/blob/f88acd440be92216a6081bbd3b9172c824768de7/plugins/insight/client/index.vue>

const root = ref<HTMLDivElement>()
const toolbarEl = ref<HTMLDivElement>()
const { width, height } = useElementSize(root)
const { height: toolbarHeight } = useElementSize(toolbarEl)
const svgHeight = computed(() => height.value - toolbarHeight.value)

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
        graph.value.simulation.alphaTarget(0.3).restart()
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

    event.preventDefault()

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
        viewboxOffset.value.dx += (tar.lastX! - x) / scale.value
        viewboxOffset.value.dy += (tar.lastY! - y) / scale.value
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
        graph.value.simulation.alphaTarget(0)

        if (tar.startX === point.clientX && tar.startY === point.clientY) {
            // Click event
            router.replace(`/words?id=${tar.word.id}`)
        }

        // Cancel fixing
        delete tar.fx
        delete tar.fy
    }
}

const scale = storeRef('wordGraphScale', 1)

const zoom = (deltaScale: number) => {
    const newScale = scale.value + deltaScale
    if (newScale < Number.EPSILON || newScale - 2.1 > Number.EPSILON) return
    scale.value = newScale
}

const center = () => {
    viewboxOffset.value.dx = graph.value.centerNode.x!
    viewboxOffset.value.dy = graph.value.centerNode.y!
}

const isFullScreen = ref(false)

const shortcutHandles = registerShortcuts([
    {
        id: 'word:graph:close',
        key: newKey('Escape'),
        info: '単語のリンク図を閉める',
        isActive: () => isFullScreen.value,
        action: () => {
            isFullScreen.value = false
        }
    }
])

onUnmounted(() => disposeShortcuts(shortcutHandles))

const onWheel = (event: WheelEvent) => {
    event.preventDefault()
    if (event.deltaY < 0) {
        zoom(+ 0.1)
    }
    else if (event.deltaY > 0) {
        zoom(- 0.1)
    }
}

useEventListener([ 'mousedown', 'touchstart' ], onDragStart)
useEventListener([ 'mousemove', 'touchmove' ], onDragMove)
useEventListener([ 'mouseup', 'touchend' ], onDragEnd)
useEventListener(root, 'wheel', onWheel)
</script>

<template>
    <div
        ref="root"
        class="word-graph-chart glowing"
        :class="{
            dragging: !! dragTarget,
            fullscreen: isFullScreen,
        }"
    >
        <div
            ref="toolbarEl"
            class="toolbar"
        >
            <span>
                <fa-icon
                    icon="magnifying-glass-minus"
                    class="button"
                    @click="zoom(- 0.1)"
                />
                <span class="number no-select">{{ scale * 100 | 0 }}%</span>
                <fa-icon
                    icon="magnifying-glass-plus"
                    class="button"
                    @click="zoom(+ 0.1)"
                />
                <fa-icon
                    icon="location-dot"
                    class="button"
                    @click="center"
                />
                <fa-icon
                    :icon="isFullScreen ? 'compress' : 'expand'"
                    class="button"
                    @click="isFullScreen = ! isFullScreen"
                />
            </span>
            <span class="graph-data">
                <span class="number">{{ graph.nodes.length }}</span> 単語 /
                <span class="number">{{ graph.edges.length }}</span> リンク
            </span>
        </div>
        <svg
            :width="width"
            :height="svgHeight"
            :viewBox="[
                - width / scale / 2 + viewboxOffset.dx,
                - svgHeight / scale / 2 + viewboxOffset.dy,
                width / scale,
                svgHeight / scale
            ].join(' ')"
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
    margin: 1em 0;
    cursor: grab;
}
.word-graph-chart.dragging {
    cursor: grabbing;
}

.word-graph-chart.fullscreen {
    position: fixed;
    top: 0;
    left: 1em;
    width: calc(100vw - 2em);
    height: calc(100vh - 2em);
    box-sizing: border-box;
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

.graph-data {
    margin-left: 1em;
}
</style>
