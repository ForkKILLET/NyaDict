<script setup lang="ts">
import { version } from '../../../package.json'
</script>

<template>
    <div class="home">
        <h1>
            Nya Dict
            <a class="no-animation" target="_blank" href="https://github.com/ForkKILLET/NyaDict/">
                <span class="version">{{ version }}</span>
            </a>
        </h1>
        <p>
            <fa-icon icon="book" /> <RouterLink to="/words">単語</RouterLink> &middot;
            <fa-icon icon="vial" /> <RouterLink to="/test">テスト</RouterLink> &middot;
            <fa-icon icon="rotate" /> <RouterLink to="/sync">同期</RouterLink>
        </p>
    </div>
</template>

<style scoped>
.home {
    text-align: center;
    margin-top: 35vh;
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
    color: #fff;
    background-color: #8358f9;
}
</style>
