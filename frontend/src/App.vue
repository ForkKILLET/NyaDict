<script setup lang="ts">
import { toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useConfig } from '@store/config'

import { useTheme } from '@util/theme'
import { registerShortcuts, newKey } from '@util/keyboard'
import { routes } from '@util/routes'

import Topbar from '@comp/Topbar.vue'
import Notifications from '@comp/notifications/Notifications.vue'

const route = useRoute()
const router = useRouter()
const { config } = storeToRefs(useConfig())

useTheme(toRefs(config.value).theme)

registerShortcuts(routes
    .filter(route => route.display)
    .map((route, index) => ({
        id: `route:${route.path}`,
        key: newKey(`ctrl+${index + 1}`),
        info: `${route.display!.info}のページへ`,
        action: () => {
            router.push(route.path)
        }
    }))
)
</script>

<template>
    <Topbar v-if="route.path !== '/'" />
    <Notifications />
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
