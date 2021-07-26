<template>
  <div class="btn btn--default">
    <slot v-bind:user="user">{{ user.lastName }}</slot>
  </div>
</template>

<script>
export default {
  name: 'button',
  data() {
    return {
      user: {
        lastName: 'liz'
      }
    }
  },
  methods: {
    reserver() {
      this.$emit('reserver')
    }
  }
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
