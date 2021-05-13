<template>
  <div>
    <div v-if="visible" class="popup popup--center">
      <div class="popup__mask"></div>
      <div class="popup__wrap">
        <img
          src="https://p1.meituan.net/travelcube/bfb149a552a5f514d0093b7f4d2488a41029.png@74w_74h_80q"
          class="popup__close"
          v-touch:tap="close"
        />
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
