<script setup lang="ts">
import { useRoute } from 'vue-router'

import Topbar from '@comp/Topbar.vue'
import Notifications from '@comp/notifications/Notifications.vue';

const route = useRoute()
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
main {
	height: calc(100vh - 3.5rem);
    box-sizing: border-box;
}
</style>
