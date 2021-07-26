<template>
  <div class="slide-tab">
    <div class="slide-tab__bar__container" :style="css2rem(containerStyles)">
      <div class="slide-tab__bar__wrap">
        <div
          :key="'tab' + index"
          v-for="(item, index) in elements"
          :style="css2rem(styles)"
          :class="[
            'slide-tab__bar',
            isActive(index) && 'slide-tab__bar--active'
          ]"
          @click="onSelectedIndexChange(index)"
        >
          <div
            :class="[
              'slide-tab__bar__text',
              isActive(index) && 'slide-tab__bar__text--active'
            ]"
          >
            {{ item.title }}
          </div>
        </div>
        <div class="slide-tab__line" :style="barLeft"></div>
      </div>
    </div>

    <div
      class="slide-tab__content__wrap"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
      @touchmove="onTouchMove"
    >
      <div
        class="slide-tab__content slide-tab__content--animated"
        :style="contentWrapStyles"
      >
        <slot />
      </div>
      <!-- <div class="slide-tab__content slide-tab__content--animated" :style="css2rem(contentWrapStyles)">
                <TabElement title="特惠日"> <div style="background: red; height: 500px">1</div> </TabElement>
                <TabElement title="抽大奖"> <div style="background: blue; height: 500px">2</div></TabElement>
                <TabElement title="大牌日"> <div style="background: yellow; height: 500px">3</div></TabElement>
      </div>-->
    </div>
  </div>
</template>
<style lang="scss" scoped>
@import './styles.scss';
</style>
<script>
import Vue from 'vue'
import Component from 'vue-class-component'
import css2rem from '../../lib/css2rem'

@Component({
  props: {
    styles: {
      type: Object
    },
    containerStyles: {
      type: Object
    }
  }
})
class Page extends Vue {
  selectedIndex = 0
  elements = []
  originX = null
  endX = null
  offset = 0
  width = document.documentElement.clientWidth
  contentWrapStyles = {}
  loaded = {}
  get len() {
    return this.elements.length
  }
  css2rem(styles) {
    return css2rem(styles)
  }
  animation(translateX, duration = 300) {
    return {
      transform: `translate(${translateX}px)`,
      transition: `${duration}ms transform`
    }
  }
  async created() {
    this.loaded[this.selectedIndex] = true
  }

  /**
   * 假设默认显示的tabbar 数量为 n ，那么tabbar下面的滑块为了居中则将整个 tab 分为 2n 份
   * 假设当前selectedIndex 为 m ，那么向左偏移的百分比就为  2m+1/2n
   * 示意图如下
   * |---.---|---.---|---.---|     三个tabbar
   * |---|---|---|---|---|---|     滑块为了居中将tab分成六份
   */
  get barLeft() {
    const selectedIndex = this.selectedIndex

    const toal = 2 * this.len
    const cur = 2 * selectedIndex + 1
    const percentage = (cur / toal).toFixed(4)

    return { left: `${percentage * 100}%` }
  }

  isActive(index) {
    return index === this.selectedIndex
  }
  addItem(item) {
    this.elements.push(item)
    let len = this.elements.length
    // this.synStart(len)
    return len
  }
  onSelectedIndexChange(index) {
    this.selectedIndex = index

    this.updateSelectedIndex()

    // this.$emit('onChange', index)
  }
  updateSelectedIndex(duration = 0) {
    this.loaded[this.selectedIndex] = true
    this.contentWrapStyles = this.animation(
      -this.width * this.selectedIndex,
      duration
    )
  }
  onTouchStart(event) {
    const { changedTouches: touches } = event
    const touch = touches[0]
    const { clientX } = touch
    this.originX = clientX
  }
  onTouchEnd() {
    const { changedTouches: touches } = event
    const touch = touches[0]
    const { clientX: endX } = touch
    let nextIndex = this.selectedIndex
    let offset = endX - this.originX
    if (offset < -30 && this.selectedIndex < this.len - 1) {
      nextIndex++
    }
    if (offset > 30 && this.selectedIndex > 0) {
      nextIndex--
    }
    this.selectedIndex = nextIndex
    this.updateSelectedIndex()
  }
  onTouchMove(event) {
    const { changedTouches: touches } = event
    const touch = touches[0]
    const { clientX } = touch
    let offset = clientX - this.originX
    // 负值正移
    if (this.selectedIndex === 0 && !(offset < 0)) return
    if (this.selectedIndex === this.len - 1 && !(offset > 0)) return

    const translateX = parseInt(
      clientX - this.originX - this.width * this.selectedIndex,
      10
    )
    this.contentWrapStyles = this.animation(translateX, 0)
  }
}
export default Page
</script>
