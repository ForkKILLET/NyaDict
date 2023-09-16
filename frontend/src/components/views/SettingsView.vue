<script setup lang="ts">
import ConfigView from '@comp/config/ConfigView.vue';
import { addNoti } from '@util/notif'

// const themeStore = useTheme()

// const selectTheme = (name: ITheme) => {
//     if (themeStore.theme === name) return
//     themeStore.theme = name
//     addNoti({
//         type: 'success',
//         content: `テーマを「${themes[name].info}」にしました。`,
//         duration: 2 * 1000
//     })
// }
</script>

<template>
    <div class="content scroll-y">
        <ConfigView />
    </div>
</template>

<style scoped>
.content {
    padding: 1em;
}
</style>
