<script setup lang="ts">
import { useRoute } from 'vue-router'

import { useConfig } from '@store/config'
import { useTheme } from '@util/theme'

import Topbar from '@comp/Topbar.vue'
import Notifications from '@comp/notifications/Notifications.vue'
import { storeToRefs } from 'pinia'
import { toRefs } from 'vue'

const route = useRoute()
const { config } = storeToRefs(useConfig())

useTheme(toRefs(config.value).theme)
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
