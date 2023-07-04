import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import HomeView from '@comp/views/HomeView.vue'
import WordsView from '@comp/views/WordsView.vue'
import TestView from '@comp/views/TestView.vue'
import SyncView from '@comp/views/SyncView.vue'
import SignInView from '@comp/views/SignInView.vue'
import SignUpView from '@comp/views/SignUpView.vue'
import StatisticsView from '@comp/views/StatisticsView.vue'
import DebugView from '@comp/views/DebugView.vue'

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
        path: '/statistics',
        component: StatisticsView
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
