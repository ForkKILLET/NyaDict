import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import HomeView from './components/views/HomeView.vue'
import WordsView from './components/views/WordsView.vue'
import TestView from './components/views/TestView.vue'
import DebugView from './components/views/DebugView.vue'

export const routes = [
    {
        path: '/',
        component: HomeView,
        name: 'home'
    },
    {
        path: '/words',
        component: WordsView,
        name: 'words'
    },
    {
        path: '/test',
        component: TestView,
        name: 'test'
    },
    {
        path: '/debug',
        component: DebugView,
        name: 'debug'
    }
] as RouteRecordRaw[]

export const router = createRouter({
    history: createWebHashHistory(),
    routes
})
