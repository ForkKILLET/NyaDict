<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useConfig, Config } from '@store/config'

import { shortcuts } from '@util/keyboard'

import ConfigItem from '@comp/config/ConfigItem.vue'
import ShortcutItem from '@comp/config/ShortcutItem.vue'

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

    <div class="shortcuts card">
        ショートカット
        <ShortcutItem
            v-for="shortcut of shortcuts"
            :shortcut="shortcut"
        />
    </div>
</template>

<style scoped>
.config-item {
    margin-bottom: 1em;
}

.shortcut-item {
    font-size: .8em;
    margin-left: 1em;
    margin-top: .5em;
}

.shortcuts {
    margin-top: 2em;
}
</style>
