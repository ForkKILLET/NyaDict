<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
    <div class="back-to-home">
        <RouterLink :to="route.path.replace(/\/[^/]+$/, '') || '/'">
            <fa-icon icon="arrow-left" /> 戻る
        </RouterLink>
    </div>
</template>

<style scoped>
.back-to-home {
    height: 1.5rem;
    padding: 1rem;
}
</style>
