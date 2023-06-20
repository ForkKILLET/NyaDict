<script setup lang="ts">
import { useRoute } from 'vue-router'

import BackToHome from './components/BackToHome.vue'
import Notifications from './components/notifications/Notifications.vue';

const route = useRoute()
</script>

<template>
    <BackToHome v-if="route.path !== '/'" />
    <Notifications />
    <main>
        <RouterView />
    </main>
</template>
