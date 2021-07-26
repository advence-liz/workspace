<template>
  <div class="shake">
    <div style="font-size:40px;">{{ shakeStatus }}</div>
    <img class="shake-img" :src="shakeImageUrl" />
  </div>
</template>

<script>
import Vue from 'vue'
import { shake, checkDeviceMotion } from './shake'

export default {
  data() {
    return { shakeStatus: false, timer: null, diffTime: 1000 }
  },
  created() {
    this.shakeImage()
    this.initShake()
  },
  computed: {
    shakeImageUrl() {
      return this.shakeStatus ? 'xx.jpg@747w_860h_80q' : 'xxx.jpg@800w_800h_80q'
    }
  },
  methods: {
    async initShake() {
      const _this = this

      try {
        await checkDeviceMotion()
      } catch (error) {
        console.error(error)
      }

      shake(
        (curTime, speed) => {
          // _this.shakeStatus = true
          console.log(curTime, _this.shakeStatus)
          _this.shakeImage()
        },
        { diffTime: this.diffTime }
      )
    },
    shakeImage() {
      const _this = this
      _this.shakeStatus = true
      if (this.timer) {
        clearTimeout(this.timer)
      }
      this.timer = setTimeout(() => {
        _this.shakeStatus = false
      }, this.diffTime)
    }
  }
}
</script>
<style lang="scss" scoped>
@mixin ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.shake {
  &-img {
    width: 300px;
    height: 400px;
    display: block;
  }
}
</style>
