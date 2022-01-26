<template>
  <div id="app">
    <h1>vue</h1>
    <div class="content">
      <Animation :animation="animation">
        <div class="sprite"></div>
      </Animation>
    </div>
  </div>
</template>

<script>
import Animation from './components/animation'
export default {
  components: { Animation },
  name: 'app',
  data() {
    return {
      animation: [{ class: 'tx' }, { class: 'ty' }],
    }
  },
  created() {
    // setTimeout(() => {
    //   this.animation = [{ class: 'tx' }]
    // }, 3000)
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
.sprite {
  width: 256px;
  height: 256px;
  background: url('https://github.com/iamalperen/playground/blob/main/SpriteSheetAnimation/sprite.png?raw=true');
  animation: sprite 0.6s steps(6, end) infinite;
}
@keyframes sprite {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: -1536px 0;
  }
}

.content {
  border: 1px solid gray;
}

.tx {
  animation: tx 3s linear;
  animation-iteration-count: infinite;
  // animation-fill-mode: backwards;
  // transform-origin: center center;
}
.ty {
  animation: ty 3s linear;
  animation-iteration-count: infinite;
  // animation-fill-mode: backwards;
  // transform-origin: center center;
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
