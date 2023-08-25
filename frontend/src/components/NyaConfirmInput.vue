<script setup lang="ts">
import { ref, toRefs, watch } from 'vue'
import { vOnClickOutside } from '@vueuse/components'
import LongPressButton from '@comp/LongPressButton.vue'

const props = defineProps<{
    modelValue: string
    disabled?: boolean
    more?: boolean
    withdrawable?: boolean
    editMode?: boolean
    withdrawWhenEmpty?: boolean
}>()

const emit = defineEmits<{
    (event: 'beforeUpdate:modelValue', value: string): void
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
const showMore = ref(false)
const root = ref<HTMLDivElement>()

const focus = () => {
    const inputEl = root.value?.querySelector('input.input') as HTMLInputElement | undefined
    inputEl?.focus()
}

const edit = () => {
    editMode.value = true
}

const clear = () => {
    if (props.withdrawWhenEmpty && ! model.ref.value) emit('withdraw')
    editMode.value = false
}

const submit = () => {
    emit('beforeUpdate:modelValue', props.modelValue)
    emit('update:modelValue', model.ref.value)
    clear()
}

watch(editMode, (mode) => {
    if (mode) setTimeout(focus, 0)
}, { immediate: true })
</script>

<template>
    <div
        ref="root"
        class="nya-confirm-input"
        :class="{ withdrawable }"
        @keydown.escape="editMode && clear()"
    >
        <template v-if="! editMode">
            <slot name="content">
                <span class="content">{{ modelValue }}</span>
            </slot>
            <div class="edit-buttons">
                <fa-icon
                    v-if="! disabled"
                    @click="edit"
                    icon="edit" class="button"
                />
                <fa-icon
                    v-if="more"
                    @click="showMore = true"
                    icon="list-dots" class="button"
                />
            </div>
            <Transition name="fade" :duration=".3 * 1000">
                <div
                    v-if="more && showMore"
                    v-on-click-outside="(event) => { event.stopPropagation(); showMore = false }"
                    class="more card deep"
                >
                    <LongPressButton
                        v-if="withdrawable"
                        @long-press="emit('withdraw')"
                        icon="trash"
                        color="#ec4e1e"
                        desc="削除"
                        :delay="1.5"
                    />
                    <slot name="more"></slot>
                </div>
            </Transition>
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
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
}

:deep(.input) {
    width: 100%;
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
    margin-left: .5rem;
    white-space: nowrap;
}

.more {
    position: absolute;
    right: 0;
    bottom: 100%;
}
.more > :deep(* + *) {
    margin-left: .5em;
}
</style>
