<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    modelValue?: boolean
}>()

const emit = defineEmits<{
    (event: 'update:modelValue', value: boolean): void
}>()

const value = computed({
    get: () => props.modelValue,
    set: v => emit('update:modelValue', v)
})
</script>

<template>
    <label class="checkbox-label">
        <input type="checkbox" v-model="value" />
        <div class="switch"></div>
    </label>
</template>

<style scoped>
.checkbox {
    display: none;
}

.switch {
    position: relative;
    width: 2.4em;
    height: 1.2em;

    border-radius: .6em;
    background-color: var(--color-ui-bg);
    border: 1px solid var(--color-ui);
    box-shadow: 0 0 .2em var(--color-shad-ui);

    transition: .3s background-color;
}

.switch::after {
    position: absolute;
    top: 0;
    left: 0;
    
    content: '';
    display: block;
    width: 1em;
    height: 1em;
    margin: .1em;
    box-sizing: border-box;

    border-radius: .6em;
    background-color: var(--color-ui);

    transition: .3s left, .3s background-color;
}

input[type=checkbox]:checked + .switch {
    background-color: var(--color-ui);
}
input[type=checkbox]:checked + .switch::after {
    background-color: var(--color-ui-bg);
    left: 1.2em;
}
</style>
