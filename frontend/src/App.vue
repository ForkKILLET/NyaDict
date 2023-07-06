<script setup lang="ts">
import { useRoute } from 'vue-router'

import BackToHome from '@comp/BackToHome.vue'
import Notifications from '@comp/notifications/Notifications.vue';

const route = useRoute()
</script>

<template>
    <BackToHome v-if="route.path !== '/'" />
    <Notifications />
    <main>
        <RouterView v-slot="{ Component }">
            <KeepAlive>
                <component :is="Component" />
            </KeepAlive>
        </RouterView>
    </main>
</template>
