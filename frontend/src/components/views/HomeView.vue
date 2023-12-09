<script setup lang="ts">
import { routes } from '@util/routes'
import { isPortrait } from '@util/media'

import NyaTitle from '@comp/NyaTitle.vue'
</script>

<template>
    <div class="home">
        <NyaTitle />
        
        <p class="links">
            <template v-for="route, index of routes.filter(route => route.display)">
                <template v-if="index">
                    <br v-if="isPortrait && index % 4 === 0">
                    <template v-else>
                        ・
                    </template>
                </template>
                <span v-if="route.display">
                    <fa-icon :icon="route.display.icon" />{{ ' ' }}
                    <RouterLink :to="route.path">{{ route.display.info }}</RouterLink>
                </span>
            </template>
        </p>
    </div>
</template>

<style scoped>
.home {
    display: flex;
    flex-flow: column;
    height: 100vh;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.links > * {
    margin: 0 .3em;
}
</style>
