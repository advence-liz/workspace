<template>
  <div class="slide-tab-element__wrap">
    <div
      v-if="$parent.loaded && $parent.loaded[index]"
      class="slide-tab-element"
    >
      <slot></slot>
    </div>
    <div v-else class="slide-tab-element slide-tab-element--empty"></div>
  </div>
</template>
<style lang="scss" scoped>
.slide-tab-element {
  width: 100%;
  &__wrap {
    flex-shrink: 0;
    width: 100%;
  }
  &--empty {
    height: 100vh;
    // background: rebeccapurple;
  }
}
</style>

<script>
export default {
  props: {
    title: {
      type: String,
      default: 'Tab 名称'
    },
    image: {
      type: String
    },
    actimage: {
      type: String
    },
    background: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      index: -1
    }
  },
  created() {
    const { title } = this
    if (this.$parent.addItem) {
      this.index = this.$parent.addItem({ title }) - 1
    }
  }
}
</script>
