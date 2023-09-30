<script setup lang="ts">
import { version } from '@/../package.json'
import { routes } from '@util/routes'

import { isPortrait } from '@util/media'
</script>

<template>
    <div class="home">
        <h1>
            Nya Dict
            <a class="no-animation" target="_blank" href="https://github.com/ForkKILLET/NyaDict/">
                <span class="version">{{ version }}</span>
            </a>
        </h1>
        
        <p class="links">
            <template v-for="route, index of routes.filter(route => route.display)">
                <template v-if="index">
                    <br v-if="isPortrait && index % 4 === 0" />
                    <template v-else>・</template>
                </template>
                <span v-if="route.display">
                    <fa-icon :icon="route.display.icon" />{{' '}}
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

h1 {
    position: relative;
}

.version {
    position: absolute;
    top: 0;
    padding: .2em;
    border-radius: .3rem;
    font-size: .8rem;
    font-weight: normal;
    color: var(--color-bg);
    background-color: var(--color-order);
}
</style>
@util/routes
