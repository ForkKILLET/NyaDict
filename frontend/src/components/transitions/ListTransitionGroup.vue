<template>
    <TransitionGroup
        name="list"
        tag="div"
    >
        <slot />
    </TransitionGroup>
</template>

<style>
.list-move, .list-enter-active, .list-leave-active {
    transition: all .5s ease;
}
.list-leave-active {
    position: absolute;
}
.list-enter-from, .list-leave-to {
    opacity: 0;
}
</style>

