<script setup lang="ts" generic="T">
import { computed } from 'vue'
import Schema from 'schemastery'
import NyaConfirmInput from '@comp/NyaConfirmInput.vue';

const props = defineProps<{
    modelValue: T
    id: string
    schema: Schema<T>
}>()

const emit = defineEmits<{
    (event: 'update:modelValue', value: T): void
}>()

const value = computed({
    get: () => props.modelValue,
    set: v => emit('update:modelValue', v)
})

const hasRole = (schema: Schema, role: string) => schema.meta.role?.split('|').includes(role)
</script>

<template>
    <div class="config-item">
        <div class="config-title">{{ schema.meta.description }}</div>
        <div class="config-form">
            <div v-if="schema.type === 'union'">
                <template v-for="item of schema.list">
                    <template v-if="hasRole(schema, 'icon')">
                        <button
                            class="card square inline"
                            :class="{ active: value === item.value }"
                            @click="value = item.value"
                        >
                            <fa-icon :icon="(item.meta.description as string)" />
                        </button>
                    </template>
                </template>
            </div>
            <div v-else-if="schema.type === 'string'">
                <NyaConfirmInput
                    v-model="(value as string)"
                    :click-to-edit="true"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
.config-title {
    margin: .5em 0;
}

.config-form {
    margin-left: 1em;
}

.nya-confirm-input {
    text-decoration: underline;
    text-decoration-color: var(--color-ui);
}
</style>
