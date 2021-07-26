<template>
  <Tab>
    <TabElement title="你好呀">111</TabElement>
    <TabElement title="我很好">111</TabElement>
  </Tab>
</template>

<script>
import Vue from 'vue'
import Component from 'vue-class-component'
import Tab from './components/slide-tab'
import TabElement from './components/slide-tab-element'

@Component({
  components: {
    Tab,
    TabElement
  }
})
class Page extends Vue {}
export default Page
</script>
