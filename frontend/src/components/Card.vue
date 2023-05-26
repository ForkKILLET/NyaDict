<template>
    <div>
        <div class="card">
            <slot></slot>
        </div>
    </div>
</template>

<style scoped>
.card {
    display: inline-block;
    padding: .8em;
    background-color: #fffaf6;
    border-radius: .8em;
    box-shadow: 0 0 .4em #faad704d;
}

.button > .card {
    user-select: none;
    cursor: pointer;
    color: #f7b96e;
    transition: .5s background-color;
}
.button > .card:hover {
    background-color: #ffffff;
}

.inline {
    display: inline-block;
    margin: 0 .5em;
}

.w1 > .card {
    width: 6em;
}
.w2 > .card {
    width: calc(6.8em * 2 + 1em);
}
</style>