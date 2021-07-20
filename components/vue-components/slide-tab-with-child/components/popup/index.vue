<template>
  <div>
    <div v-if="visible" class="popup popup--center">
      <div class="popup__mask"></div>
      <div class="popup__wrap">
        <img src class="popup__close" v-touch:tap="close" />
        <slot></slot>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
@import './styles.scss';
</style>
<script>
import Vue from 'vue'
import Component from 'vue-class-component'

function toggleBodyScroll(isFixed) {
  let bodyEl = document.body
  let top = 0
  if (isFixed) {
    top = window.scrollY

    bodyEl.style.position = 'fixed'
    bodyEl.style.top = -top + 'px'
  } else {
    bodyEl.style.position = ''
    bodyEl.style.top = ''

    window.scrollTo(0, top)
  }
}

@Component({
  props: {
    visible: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    visible(val) {
      toggleBodyScroll(val)
    }
  }
})
class Popup extends Vue {
  close() {
    this.$emit('close')
  }
}
export default Popup
</script>
