<template>
  <div class="slide-tab">
    <div class="slide-tab__bar__container" :style="containerStyles">
      <div class="slide-tab__bar__wrap">
        <div
          :key="'tab' + index"
          v-for="(item, index) in elements"
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
      :style="{ height: `${height}px` }"
    >
      <div
        ref="slideTabContent"
        class="slide-tab__content slide-tab__content--animated"
        :style="contentWrapStyles"
      >
        <div class="slide-tab__item" style="background:red"></div>
        <div class="slide-tab__item" style="background:green"></div>
        <div class="slide-tab__item" style="background:blue"></div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
@import './styles.scss';
.slide-tab__item {
  height: 100vh;
  flex-shrink: 0;
  width: 100%;
}
</style>

<script>
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  // components: {
  //     TabElement
  // },
  watch: {
    selectedIndex: function() {
      // this.setHeight()
    }
  },
  props: {
    styles: {
      type: Object
    },
    containerStyles: {
      type: Object
    },
    tagStyles: {
      type: Object
    }
  },
  block: {
    listen: {
      dcCanSlideMove(canMove) {
        this.canMove = canMove
      }
    }
  }
})
class Page extends Vue {
  selectedIndex = 0
  elements = [{ title: '1111' }, { title: '2222' }, { title: '3333' }]
  originX = null
  originY = null
  lockX = false
  judgeX = 0
  judgeY = 0
  endX = null
  canMove = true
  // 用来tab content 切换效果
  contentWrapStyles = {}
  width = innerWidth
  height = innerHeight
  loaded = {}
  get len() {
    return this.elements.length
  }
  // 移动
  animation(translateX, duration = 300) {
    return {
      transform: translateX === 0 ? 'none' : `translate(${translateX}px)`,
      transition: `${duration}ms transform`
    }
  }
  async created() {
    // 初始的时候默认加载第一个tab页面
    this.loaded[this.selectedIndex] = true
    // transform: translate3d(0, 0, 0);
  }
  mounted() {
    // const children = this.$refs.slideTabContent && this.$refs.slideTabContent.children
    // if (children && children[1]) {
    //     children[1].children[0].style.transform = 'translate3d(0, 0, 0)'
    // }
    // this.timer = setInterval(this.setHeight, 1000)
  }
  destroyed() {
    clearInterval(this.timer)
  }

  /**
   * 假设默认显示的tabbar 数量为 n ，那么tabbar下面的滑块为了居中则将整个 tab 分为 2n 份
   * 假设当前selectedIndex 为 m ，那么向左偏移的百分比就为  2m+1/2n
   * 示意图如下
   * |---.---|---.---|---.---|     三个tabbar
   * |---|---|---|---|---|---|     滑块为了居中将tab分成六份
   */
  // 动画
  get barLeft() {
    const selectedIndex = this.selectedIndex
    const toal = 2 * this.len
    const cur = 2 * selectedIndex + 1
    const percentage = (cur / toal).toFixed(4)
    return { left: `${percentage * 100}%` }
  }

  // 是否是当前显示的tab
  isActive(index) {
    return index === this.selectedIndex
  }
  // 选择tab
  onSelectedIndexChange(index) {
    if (this.selectedIndex === index) return
    const pre = this.selectedIndex
    this.selectedIndex = index
    this.updateSelectedIndex(pre, index)
    // this.$emit('onChange', index)
  }
  // 更新当前tab页面
  updateSelectedIndex(preIndex = 0, nextIndex = 0, duration = 0) {
    this.loaded[this.selectedIndex] = true
    this.contentWrapStyles = this.animation(
      -this.width * this.selectedIndex,
      duration
    )
    // if (preIndex !== nextIndex) {
    // 埋点
    // }
  }
  // 开始搓屏幕了
  onTouchStart(event) {
    const { changedTouches: touches } = event
    const touch = touches[0]
    const { clientX, clientY } = touch
    this.originX = clientX
    this.originY = clientY
    setTimeout(() => {
      this.judgeDirection()
    }, 50)
  }
  // 搓完了
  onTouchEnd() {
    if (this.lockX && this.canMove) {
      const { changedTouches: touches } = event
      const touch = touches[0]
      const { clientX: endX } = touch
      let nextIndex = this.selectedIndex
      let offset = endX - this.originX
      if (offset < -innerWidth / 4 && this.selectedIndex < this.len - 1) {
        nextIndex++
      }
      if (offset > innerWidth / 4 && this.selectedIndex > 0) {
        nextIndex--
      }

      const preIndex = this.selectedIndex
      this.selectedIndex = nextIndex
      this.updateSelectedIndex(preIndex, nextIndex, 500)
    }
    this.lockX = false
    document.body.style.overflow = 'scroll'
  }
  // 搓来搓去
  onTouchMove(event) {
    const { changedTouches: touches } = event
    const touch = touches[0]
    const { clientX, clientY } = touch
    let offset = clientX - this.originX
    this.judgeX = clientX - this.originX
    this.judgeY = clientY - this.originY
    // 负值正移
    if (this.selectedIndex === 0 && !(offset < 0)) return
    if (this.selectedIndex === this.len - 1 && !(offset > 0)) return

    const translateX = parseInt(
      clientX - this.originX - this.width * this.selectedIndex,
      10
    )
    if (this.lockX && this.canMove) {
      this.contentWrapStyles = this.animation(translateX, 0)
      document.body.style.overflow = 'hidden'
    }
  }
  // 判断初始搓的方向，锁定单一方向滚动
  judgeDirection() {
    if (Math.abs(this.judgeX) > Math.abs(this.judgeY)) {
      this.lockX = true
    }
  }
}
export default Page
</script>
