<template>
    <div id="app">
        <h1>vue</h1>
        hello world!!! sample-vue {{num}}
    </div>
</template>

<script>
import m from 'hel-lodash'
export default {
    name: 'app',
    data() {
        return { num: m.random(1, 10) }
    }
}
</script>

<style></style>
