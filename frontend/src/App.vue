<script setup lang="ts">
import { useRoute } from 'vue-router'

import BackToHome from './components/BackToHome.vue'

const route = useRoute()
</script>

<template>
    <BackToHome v-if="route.path !== '/'" />
    <main>
        <RouterView />
    </main>
</template>
