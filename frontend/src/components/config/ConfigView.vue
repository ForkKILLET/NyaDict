<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useConfig, Config } from '@store/config'

import { groupBy } from '@util/index'

import ConfigItem from '@comp/config/ConfigItem.vue'
import ShortcutList from '@comp/ShortcutList.vue';

const { config } = storeToRefs(useConfig())

const configSections = groupBy(Object.entries(Config.dict!), ([, schema ]) => schema.meta.section)
</script>

<template>
    <div class="config-list">
        <div class="card" v-for="schemas, section in configSections">
            <span>{{ section }}</span>
            <ConfigItem
                v-for="[ id, schema ] of schemas"
                v-model="config[id]"
                :schema="schema"
                :id="id"
            />
        </div>
    </div>

    <ShortcutList class="card" />
</template>

<style scoped>
.config-item {
    margin-bottom: 1em;
}

.card {
    margin-bottom: 2em;
}

.card > span:first-child {
    font-weight: bold;
    font-size: 1.1em;
    color: var(--color-ui);
}
</style>
