<template>
  <div class="scroll-tips" v-if="list && list.length">
    <div class="scroll-tips__item__wrap" :class="{ 'animate-up': animateUp }">
      <div class="scroll-tips__item" v-for="item in list" :key="item.id">
        <div
          class="scroll-tips__item__avatar"
          :style="{ backgroundImage: `url(${item.userAvatarUrl})` }"
        ></div>
        <div>
          {{ item.userName }}刚刚摇到{{
            item.rewardAmount | formatAmount
          }}元奖励金
        </div>
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

@Component({
  props: {}
})
class ScrollTips extends Vue {
  list = new Array(12).fill({
    userAvatarUrl: '',
    userName: 'xxx',
    rewardAmount: 'xxx'
  })
  defaultAvatar = ''
  animateUp = false
  timer = null

  created() {
    // getWinRewardPrizeUserList(this.drawLotterySecret).then(res => {
    //     res && (this.list = this.initData(res))
    // })
  }

  destroyed() {
    clearInterval(this.timer)
  }

  mounted() {
    this.timer = setInterval(this.scrollAnimate, 2000)
  }

  // initData(res) {
  //   if (!Array.isArray(res)) return []
  //   res.forEach(item => {
  //     if (item.userAvatarUrl) {
  //       item.userAvatarUrl = `${
  //         decodeURIComponent(item.userAvatarUrl).split('@')[0]
  //       }@50w_50h_1e_1c`
  //     } else {
  //       item.userAvatarUrl = this.defaultAvatar
  //     }
  //   })
  //   return res
  // }

  scrollAnimate() {
    if (this.list.length <= 1) return
    this.animateUp = true
    setTimeout(() => {
      this.list.push(this.list[0])
      this.list.shift()
      this.animateUp = false
    }, 600)
  }

  toast(msg) {
    window.Block.trigger('infopop', msg)
  }
}

export default ScrollTips
</script>
