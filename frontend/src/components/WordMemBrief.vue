<script setup lang="ts">
import type { IMemory } from '../types'
import Correctness from './Correctness.vue';
defineProps<{
    mem: IMemory
}>()
</script>

<template>
    <Correctness :correct="mem.correctNum" :wrong="mem.wrongNum" />
</template>
