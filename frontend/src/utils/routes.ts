import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw, RouteLocationNormalizedLoaded } from 'vue-router'

import HomeView from '@comp/views/HomeView.vue'
import WordsView from '@comp/views/WordsView.vue'
import TestView from '@comp/views/TestView.vue'
import TestCreateView from '@comp/views/TestCreateView.vue'
import TestGoView from '@comp/views/TestGoView.vue'
import StatisticsView from '@comp/views/StatisticsView.vue'
import SyncView from '@comp/views/SyncView.vue'
import SignInView from '@comp/views/SignInView.vue'
import SignUpView from '@comp/views/SignUpView.vue'
import ArchiveEditionTree from '@comp/views/ArchiveEditionTreeView.vue'
import SettingsView from '@comp/views/SettingsView.vue'
import DebugView from '@comp/views/DebugView.vue'
import AboutView from '@comp/views/AboutView.vue'

export const routes = [
    {
        path: '/',
        component: HomeView
    },
    {
        path: '/words',
        component: WordsView,
        display: {
            info: '単語',
            icon: 'book'
        }
    },
    {
        path: '/test',
        component: TestView,
        display: {
            info: 'テスト',
            icon: 'vial'
        }
    },
    {
        path: '/test/create',
        component: TestCreateView        
    },
    {
        path: '/test/go',
        component: TestGoView,
    },
    {
        path: '/statistics',
        component: StatisticsView,
        display: {
            info: '統計',
            icon: 'chart-line'
        }
    },
    {
        path: '/sync',
        component: SyncView,
        display: {
            info: '同期',
            icon: 'rotate'
        }
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
        path: '/sync/tree/:id',
        component: ArchiveEditionTree
    },
    {
        path: '/settings',
        component: SettingsView,
        display: {
            info: '設定',
            icon: 'cog'
        }
    },
    {
        path: '/debug',
        component: DebugView
    },
    {
        path: '/about',
        component: AboutView
    }
] as Array<RouteRecordRaw & {
    display?: {
        info: string
        icon: string
    }
}>

export const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export const getParentPath = (route: RouteLocationNormalizedLoaded) => (
    route.path.replace(/\/[^/]*?$/, '') || '/'
)
