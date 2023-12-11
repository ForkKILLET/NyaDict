<script setup lang="ts">
import { toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useModal } from '@store/modal'
import { useConfig } from '@store/config'

import { useTheme } from '@util/theme'
import { registerShortcuts, newKey } from '@util/keyboard'
import { getParentPath, routes } from '@util/routes'

import Topbar from '@comp/Topbar.vue'
import Notifications from '@comp/notifications/Notifications.vue'
import ShortcutList from '@comp/ShortcutList.vue'
import Modal from '@comp/Modal.vue'
import { mitt } from '@util/mitt'

const route = useRoute()
const router = useRouter()
const { config } = storeToRefs(useConfig())

useTheme(toRefs(config.value).theme)

const history: string[] = []
router.afterEach((to) => {
    history.unshift(to.fullPath)
})

const modalStore = useModal()

registerShortcuts([
    ...routes
        .filter((route): route is Required<typeof route> => !! route.display)
        .map(({ path, display }, index) => ({
            id: `route:${path}`,
            key: newKey(`Ctrl + ${index + 1}`),
            info: `${display.info}のページへ`,
            action: () => {
                router.push(history.find(hist => hist.startsWith(path)) ?? path)
            }
        })),
    {
        id: 'route:up',
        key: newKey('Ctrl + ArrowUp'),
        info: 'アップのページへ',
        action: () => {
            router.push(getParentPath(route))
        }
    }
])

registerShortcuts([
    {
        id: 'shortcut:modal',
        key: newKey('Ctrl + k'),
        info: 'ショートカットを見る',
        action: () => {
            modalStore.open(ShortcutList)
        }
    },
    {
        id: 'shortcut:re-edit',
        key: newKey('.'),
        info: '最後に編集したフィールドを編集',
        action: () => {
            mitt.emit('ui:re-edit', {})
        }
    }
])
</script>

<template>
    <Topbar v-if="route.path !== '/'" />
    <Notifications />
    <Modal />
    <main class="scroll-y">
        <RouterView v-slot="{ Component }">
            <KeepAlive>
                <component :is="Component" />
            </KeepAlive>
        </RouterView>
    </main>
</template>

<style scoped>
.topbar ~ main {
	height: calc(100vh - 3.5rem);
    box-sizing: border-box;
}
</style>
