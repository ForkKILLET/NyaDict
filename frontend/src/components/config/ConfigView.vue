<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useConfig, Config } from '@store/config'

import ConfigItem from '@comp/config/ConfigItem.vue'

const { config } = storeToRefs(useConfig())
</script>

<template>
    <div>
        <ConfigItem
            v-for="schema, id in Config.dict"
            v-model="config[id]"
            :schema="schema"
            :id="id"
        />
    </div>
</template>

<style scoped>
.config-item {
    margin-bottom: 1em;
}
</style>
