<script setup lang="ts">
const props = defineProps<{
    title: string
    submit: () => void
    pending: boolean
}>()

const onSubmit = () => {
    if (props.pending) return
    props.submit()
}
</script>

<template>
    <div class="content card">
        <div class="panel">
            <h2>{{ title }}</h2>
            <slot></slot>
            <div>
                <button @click="onSubmit" class="card inline up">
                    <fa-icon
                        :icon="pending ? 'spinner' : 'arrow-right'"
                        :spin="pending"
                        class="button no-animation"
                    />
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.content {
    width: 40%;
    min-width: 20em;
    max-width: 40em;
    margin-left: auto;
    margin-right: auto;
    text-align: center;
}

.panel {
    margin-bottom: 1em;
    padding: 2em;
}

h2 {
    margin: 0;
}

.panel:deep(> div) {
    margin-top: .8em;
}

.panel:deep(> div > input) {
    flex: 1;
    width: 0;
}

.panel:deep(> .item) {
    display: flex;
    align-items: center;
}

.panel:deep(> .item) > svg:first-child {
    margin-right: .5em;
}
</style>
