<template>
  <div id="app">
    <div class="box">
      <div :key="index" v-for="(itme, index) in list" class="ball">
        <div class="inner"></div>
      </div>
    </div>

    <h1 @click="go">vue</h1>
  </div>
</template>

<script>
import Button from './components/button'
export default {
  components: { Button },
  name: 'app',
  data() {
    return { list: [] }
  },
  created() {},
  methods: {
    go() {
      this.list = []
      for (let i = 0; i < 8; i++) {
        setTimeout(i => {
          this.list.push(i)
        }, i * 80)
      }
    }
  }
}
</script>

<style lang="scss">
.ball {
  position: absolute;
  left: 0;
  top: 70px;
  z-index: 20px;
  animation: py 1s cubic-bezier(0.41, -0.62, 0.83, 0.67) forwards;
  .inner {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: red;
    animation: px 1s linear forwards infinite;
  }

  // animation: px 0.5s linear forwards, py 0.5s ease-in forwards;
  // animation: px 0.5s ease-in forwards;
}

@keyframes px {
  100% {
    transform: translatex(300px);
  }
}

@keyframes py {
  80% {
    opacity: 1;
  }
  100% {
    transform: translateY(120px);
    opacity: 0;
  }
}

.box {
  background: gray;
  height: 375px;
  position: relative;
}
body {
  padding: 0;
  margin: 0;
}
</style>
