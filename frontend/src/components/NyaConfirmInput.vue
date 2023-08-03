<script setup lang="ts">
import { ref } from 'vue'
import LongPressButton from './LongPressButton.vue';

const props = defineProps<{
    modelValue: string
    autofocus?: boolean
    disabled?: boolean
    withdrawable?: boolean
    editMode?: boolean
}>()

const emit = defineEmits<{
    (event: 'update:modelValue', value: string): void
    (event: 'withdraw'): void
}>()

const value = ref(props.modelValue)

const editMode = ref(props.editMode)

const clear = () => {
    editMode.value = false
}

const submit = () => {
    emit('update:modelValue', value.value)
    clear()
}
</script>

<template>
    <div class="nya-confirm-input" :class="{ withdrawable }">
        <template v-if="! editMode">
            <slot name="content">
                <span class="value">{{ modelValue }}</span>
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
                    :duration="1.5"
                />
            </div>
        </template>
        <template v-else>
            <input
                v-model="value"
                @keypress.enter="submit"
                :autofocus="autofocus"
            />
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

input {
    margin: -.1rem -.3rem;
    padding: .1rem .3rem;
    border-radius: .5rem;
    box-shadow: 0 0 .3rem #f3aa6d4d;
    font: inherit;
    transition: .3s box-shadow;
}

input:hover, input:focus {
    box-shadow: 0 0 .4rem #faae70ef;
}

.edit-buttons {
    margin-left: .3rem;
    white-space: nowrap;
}
</style>
