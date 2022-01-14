<template>
  <div id="app">
    <h1>vue</h1>
    <div class="content">
      <div class="box">
        <div
          v-on:webkitAnimationEnd="animationend"
          v-on:webkitAnimationStart="animationstart"
          v-on:animationstart="animationstart"
          v-on:animationend="animationend"
          class="box__inner"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import Button from './components/button'
export default {
  components: { Button },
  name: 'app',
  created() {
    const animation = [['x', 'y'], 'z']
  },
  methods: {
    animationstart() {
      console.log('animationstart', new Date())
    },
    animationend() {
      console.log('animationend', new Date())
    },
  },
}
</script>

<style lang="scss">
.content {
  border: 1px solid gray;
}
.box {
  // transform-origin: center center;
  // animation: name duration timing-function delay iteration-count direction fill-mode;
  // animation: tx 3s linear, ty 3s 0s linear;
  animation: ty 3s linear;
  // animation-duration: 3s;
  // animation-timing-function: linear;
  // animation-direction: alternate;
  animation-iteration-count: 2;
  // animation-fill-mode: backwards;
  transform-origin: center center;
  &__inner {
    content: '';
    display: block;
    height: 200px;
    width: 200px;
    position: relative;
    background: red;
    animation: tx 3s linear;
    animation-iteration-count: 2;
    // animation-direction: alternate;
    animation-fill-mode: backwards;
    transform-origin: center center;
  }
}

// @keyframes ddd {
//   to {
//     /*         3rd           2nd              1st    这种写法动画是同时进行的，并没有发现执行顺序   */
//     transform: translateX(200px) translateY(200px) rotate(360deg);
//   }
// }
// @keyframes ddd {
//   30% {
//     transform: translateX(200px);
//   }
//   50% {
//     transform: translateX(200px) translateY(200px);
//   }
//   90% {
//     transform: translateX(200px) translateY(200px) rotate(90deg);
//   }
// }
@keyframes tx {
  100% {
    // transform: rotate(360deg);
    transform: translateX(200px);
    // transform: ro(200px); //  x 200  y 0
  }
}
@keyframes ty {
  100% {
    transform: translateY(359px); // x 0 y 200
    // transform: rotate(360deg);
  }
}
</style>
