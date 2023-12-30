<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useConfig, Config } from '@store/config'

import { groupBy } from '@util/index'

import ConfigItem from '@comp/config/ConfigItem.vue'
import ShortcutList from '@comp/ShortcutList.vue'

const { config } = storeToRefs(useConfig())

const configSections = groupBy(Object.entries(Config.dict!), ([, schema ]) => schema.meta.section)
</script>

<template>
    <div class="config-list">
        <div
            v-for="schemas, section in configSections"
            class="card"
        >
            <span>{{ section }}</span>
            <template
                v-for="[ id, schema ] of schemas"
                :key="id"
            >
                <ConfigItem
                    v-if="! schema.meta.hidden"
                    :id="id"
                    v-model="config[id]"
                    :schema="schema"
                />
            </template>
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
