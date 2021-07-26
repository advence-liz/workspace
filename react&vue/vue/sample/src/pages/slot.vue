<template>
  <div class="btn btn--default">
    <Button v-slot="slotProps">{{ slotProps.user.lastName }}</Button>
  </div>
</template>

<script>
import Button from '../components/Button.vue'
export default {
  name: 'button',
  components: { Button },
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
