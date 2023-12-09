<script setup lang="ts">
import { computed } from 'vue'
import { useTest } from '@store/test'
import NyaList from '@comp/NyaList.vue'
import TestEntry from '@comp/TestEntry.vue'

const testStore = useTest()

const sortedTests = computed(() => [...testStore.tests].sort((a, b) => b.id - a.id))
</script>

<template>
    <NyaList
        :items="sortedTests"
        class="test-list"
    >
        <template #header="{ count }">
            <span class="number">{{ count }}</span> テスト
            <RouterLink to="/test/create">
                <fa-icon
                    icon="circle-plus"
                    class="button"
                />
            </RouterLink>
        </template>
        <template #default="{ item: test }">
            <TestEntry :test="test" />
        </template>
    </NyaList>
</template>
