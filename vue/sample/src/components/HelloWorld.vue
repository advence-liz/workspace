<template>
    <div class="hello">
        <h1>{{ name }}</h1>
        <Button @click="reserver">reserver</Button>
    </div>
</template>

<script>
import Button from './Button'

export default {
    name: 'HelloWorld',
    components: {
        Button
    },
    data: function() {
        return {
            name: 'HelloWorl'
        }
    },
    methods: {
        reserver() {
            this.name = this.name
                .split('')
                .reverse()
                .join('')
        }
    },
    props: {
        msg: String
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
h3 {
    margin: 40px 0 0;
}
ul {
    list-style-type: none;
    padding: 0;
}
li {
    display: inline-block;
    margin: 0 10px;
}
a {
    color: #42b983;
}
</style>
