<template>
  <div id="app">
    <h1>vue</h1>

    <div class="box"></div>
  </div>
</template>

<script>
import Button from './components/button'
export default {
  components: { Button },
  name: 'app'
}
</script>

<style lang="scss">
.box {
  height: 200px;
  width: 200px;
  background: red;
  // animation: name duration timing-function delay iteration-count direction fill-mode;
  animation: ty 3s linear, tx 3s 0s linear;
  // animation-duration: 3s;
  // animation-timing-function: linear;
  // animation-direction: alternate;
  animation-iteration-count: infinite;
  animation-fill-mode: forwards;
  // transform-origin: top left;
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
    transform: translateX(200px); //  x 200  y 0
  }
}
@keyframes ty {
  100% {
    transform: translateY(200px); // x 0 y 200
  }
}
</style>
