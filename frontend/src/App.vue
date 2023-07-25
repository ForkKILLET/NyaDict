<script setup lang="ts">
import { useRoute } from 'vue-router'

import Topbar from '@comp/Topbar.vue'
import Notifications from '@comp/notifications/Notifications.vue';

const route = useRoute()
</script>

<template>
    <Topbar v-if="route.path !== '/'" />
    <Notifications />
    <main>
        <RouterView v-slot="{ Component }">
            <KeepAlive>
                <component :is="Component" />
            </KeepAlive>
        </RouterView>
    </main>
</template>
