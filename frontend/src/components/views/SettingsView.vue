<script setup lang="ts">
import { addNoti } from '@util/notif'
import { useTheme, themes, type ITheme } from '@store/theme'

const themeStore = useTheme()

const selectTheme = (name: ITheme) => {
    if (themeStore.theme === name) return
    themeStore.theme = name
    addNoti({
        type: 'success',
        content: `テーマを「${themes[name].info}」にしました。`,
        duration: 2 * 1000
    })
}
</script>

<template>
    <div class="content scroll-y">
        <div>
            <button
                v-for="theme, name of themes"
                class="card square inline"
                :class="{ active: themeStore.theme === name }"
            >
                <fa-icon
                    :icon="theme.icon"
                    @click="selectTheme(name)"
                />
            </button>
        </div>
    </div>
</template>

<style scoped>
.content {
    padding: 1em;
}
</style>
