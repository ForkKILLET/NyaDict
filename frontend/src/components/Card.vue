<template>
    <div class="card">
        <slot></slot>
    </div>
</template>

<style scoped>
.card {
    padding: .8em;
    background-color: #fffaf6;
    border-radius: .8em;
    box-shadow: 0 0 .4em #faad704d;
}

.card.button {
    user-select: none;
    cursor: pointer;
    color: #f7b96e;
    transition: .5s all;
}
.card.button:hover {
    background-color: #ffffff;
}

.card.active {
    color: #fff;
    background-color: #db8e30;
}

.test-mode.active:hover {
    color: #f7b96e;
    background-color: #db8e30;
}

.card.disabled {
    color: #aaa;
    text-decoration: line-through;
}

.inline.card {
    display: inline-block;
    margin-right: 1em;
}

.card.w1 {
    width: 6em;
}
.card.w2 {
    width: calc(6.8em * 2 + 1em);
}
</style>
