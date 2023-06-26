<template>
    <div class="card">
        <slot></slot>
    </div>
</template>

<style scoped>
.card {
    box-sizing: border-box;
    padding: .8em;
    background-color: #fffaf6;
    border-radius: .8em;
    box-shadow: 0 0 .4em #faad704d;
}
.card.up {
    background-color: #fff;
}
.card.button {
    user-select: none;
    cursor: pointer;
    color: #db8e30;
    transition: .5s color, .5s background-color, .5s box-shadow;
}
.card.button:hover, .card.button:active {
    color: #f7b96e;
    background-color: #ffffff;
    box-shadow: 0 0 .4em #faae70ef;
}

.card.active {
    color: #fff;
    background-color: #db8e30;
}
.card.active:hover {
    color: #f7b96e;
    background-color: #db8e30;
}

.card.disabled {
    color: #aaa;
    text-decoration: line-through;
}

.inline.card {
    display: inline-block;
}
.inline.card:not(:last-of-type) {
    margin-right: 1em;
}

.card.w1 {
    width: 5em;
}
.card.w2 {
    width: calc(5em * 2 + 1em);
}
.card.w3 {
    width: calc(5em * 3 + 2em);
}
</style>
