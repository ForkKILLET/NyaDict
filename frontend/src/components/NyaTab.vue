<script setup lang="ts">
import { ref } from 'vue';

type TabData = {
    name: string
    title: string
}

const props = defineProps<{
    tabs: TabData[]
}>()

const activeTabName = ref<string>(props.tabs[0].name)
</script>

<template>
    <div class="nya-tab" :data-tab="activeTabName">
        <div class="nya-tab-header">
            <template v-for="tab of tabs">
                <span v-if="tab.name === activeTabName" class="active">{{ tab.title }}</span>
                <span v-else @click="activeTabName = tab.name">{{ tab.title }}</span>
            </template>
        </div>
        <slot :name="activeTabName"></slot>
    </div>
</template>

<style scoped>
.nya-tab-header {
    margin-bottom: 1em;
}

.nya-tab-header > span.active {
    color: #db8e30;
    background: #f3e4d8;
}

.nya-tab-header > span {
    padding: 0 .5em;
    border-radius: .3em .3em 0 0;
    border-bottom: 2px solid #db8e30;
    font-size: 1.3em;
    font-weight: bold;
    transition: .3s color;
    cursor: pointer;
}

.nya-tab-header > span:hover {
    color: #db8e30;
}
</style>
