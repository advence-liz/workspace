<template>
    <div class="btn btn--default" @click="$emit('click')">
        <slot></slot>
    </div>
</template>

<script>
export default {
    // // name: 'button',
    // methods: {
    //     reserver() {
    //       this.$emit('reserver')
    //     }
    // },
    // props: {
    //     click
    // }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.btn {
    display: inline-block;
    &--default {
        background: #ffffff;
        border: 1px solid gray;
    }
}
</style>
