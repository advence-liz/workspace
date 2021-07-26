<template>
  <div id="app">
    <h1>Hello App!</h1>

    <!-- 使用 router-link 组件来导航. -->
    <!-- 通过传入 `to` 属性指定链接. -->
    <!-- <router-link> 默认会被渲染成一个 `<a>` 标签 -->
    <ul>
      <li v-for="item in routes" :key="item.message">
        <router-link :to="item.path">{{ item.path }}</router-link>
      </li>
    </ul>

    <!-- 路由出口 -->
    <!-- 路由匹配到的组件将渲染在这里 -->
    <router-view></router-view>
  </div>
</template>

<script>
import { routes } from './router'
export default {
  name: 'App',
  data() {
    return {
      routes
    }
  }
}
</script>

<style lange="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
