<script setup lang="ts">
import Card from './Card.vue'

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
    <div class="content">
        <Card class="panel">
            <h2>{{ title }}</h2>
            <slot></slot>
            <div>
                <Card @click="onSubmit" class="inline button up">
                    <fa-icon
                        :icon="pending ? 'spinner' : 'arrow-right'"
                        :spin="pending"
                        class="button no-animation"
                    />
                </Card>
            </div>
        </Card>
    </div>
</template>

<style scoped>
.content > .card {
    width: 40%;
    min-width: 200px;
    max-width: 400px;
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
