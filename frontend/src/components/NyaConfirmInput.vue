<script setup lang="ts">
import { ref, toRefs, watch } from 'vue'
import LongPressButton from './LongPressButton.vue'

const props = defineProps<{
    modelValue: string
    disabled?: boolean
    withdrawable?: boolean
    editMode?: boolean
    withdrawWhenEmpty?: boolean
}>()

const emit = defineEmits<{
    (event: 'update:modelValue', value: string): void
    (event: 'withdraw'): void
}>()

const { modelValue } = toRefs(props)
const model = {
    ref: ref(modelValue.value)
}
watch(modelValue, newValue => {
    model.ref.value = newValue
})

const editMode = ref(props.editMode)

const clear = () => {
    if (props.withdrawWhenEmpty && ! model.ref.value) emit('withdraw')
    editMode.value = false
}

const submit = () => {
    emit('update:modelValue', model.ref.value)
    clear()
}
</script>

<template>
    <div class="nya-confirm-input" :class="{ withdrawable }">
        <template v-if="! editMode">
            <slot name="content">
                <span class="content">{{ modelValue }}</span>
            </slot>
            <div class="edit-buttons">
                <fa-icon
                    v-if="! disabled"
                    @click="editMode = true"
                    icon="edit" class="button"
                />
                <LongPressButton
                    v-if="withdrawable"
                    @long-press="emit('withdraw')"
                    icon="trash"
                    color="#ec4e1e"
                    :delay="1.5"
                />
            </div>
        </template>
        <template v-else>
            <slot name="input" :model="model" :submit="submit">
                <input
                    class="input"
                    v-model="model.ref.value"
                    @keypress.enter="submit"
                />
            </slot>
            <div class="edit-buttons">
                <fa-icon
                    @click="clear"
                    icon="times-circle" class="button"
                />
                <fa-icon
                    @click="submit"
                    icon="check-circle" class="button"
                />
            </div>
        </template>
    </div>
</template>

<style scoped>
.nya-confirm-input {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
}

.nya-confirm-input.withdrawable {
    line-height: 2rem;
}

:deep(.input) {
    margin: -.1rem -.3rem;
    padding: .1rem .3rem;
    border-radius: .5rem;
    box-shadow: 0 0 .3rem #f3aa6d4d;
    font: inherit;
    transition: .3s box-shadow;
}

:deep(.input:hover, .input:focus) {
    box-shadow: 0 0 .4rem #faae70ef;
}

.edit-buttons {
    margin-left: .3rem;
    white-space: nowrap;
}
</style>
