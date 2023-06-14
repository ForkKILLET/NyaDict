import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import HomeView from './components/views/HomeView.vue'
import WordsView from './components/views/WordsView.vue'
import TestView from './components/views/TestView.vue'
import SyncView from './components/views/SyncView.vue'
import SignInView from './components/views/SignInView.vue'
import SignUpView from './components/views/SignUpView.vue'
import DebugView from './components/views/DebugView.vue'

export const routes = [
    {
        path: '/',
        component: HomeView
    },
    {
        path: '/words',
        component: WordsView
    },
    {
        path: '/test',
        component: TestView
    },
    {
        path: '/sync',
        component: SyncView
    },
    {
        path: '/sync/sign-in',
        component: SignInView
    },
    {
        path: '/sync/sign-up',
        component: SignUpView
    },
    {
        path: '/debug',
        component: DebugView
    }
] as RouteRecordRaw[]

export const router = createRouter({
    history: createWebHashHistory(),
    routes
})
