http://i.meituan.com/awp/hfe/block/00ff27ca7ccc4deb96292af02dda3c43.html?cube_h=48d71433401d4f84288a&cube_i=99154
```jsx
      <div
                        class="template"
                        v-for="(item, index) in form.pwTemplateModels"
                        :key="'template' + index"
                    >
                        <div class="template__head">模板 {{ index + 1 }}</div>

                        <el-form-item label="文案内容" prop="pwTemplateModels">
                            <el-button
                                round
                                size="mini"
                                type="text"
                                @click="insertToken(index, 0, $event)"
                                >插入口令</el-button
                            >
                            <el-button
                                round
                                size="mini"
                                type="text"
                                @click="insertToken(index, 1, $event)"
                                >插入链接</el-button
                            >
                            <el-input
                                type="textarea"
                                class="form-input"
                                ref="input" // ref 在列表中最终会是数组的形态
                                v-model="item.template"
                                placeholder="请输入配置名称"
                                auto-complete="off"
                                @blur="onBlur"
                            >
                            </el-input>
                        </el-form-item>mplate' + index"
                    >
                    
                    
```
## style 中添加函数

```vue
 <span :style="{'font-size': discountSize(coupon.discount) }">{{coupon.discount}}%</span>
```
## class
```jsx


   :class="['tab', isFixed && 'tab--fixed']"
    ref="$tab"
    :style="{
      position: isFixed ? 'fixed' : hasScroll ? 'absolute' : 'static',
      top: isFixed ? `${nativeTitleHeight + 10}px` : ''
    }"
    
   <div class="floor__bd__tab" v-if="subTabs.length >= 2">
                <div
                    :key="item.itemId"
                    v-for="(item, index) of subTabs"
                    :style="{
                        background: selectedIndex === index ? config.backgroundActive : config.background,
                        color: selectedIndex === index ? config.colorActive : config.color
                    }"
                    :class="['floor__bd__tab-item', selectedIndex === index && 'floor__bd__tab-item--active']"
                    @click="onSelectChange(item, index)"
                >
                    {{ item.bizData.PROMOTION_TAB_NAME }}
                </div>
            </div>
```
## event
```jsx
<button v-on:click="warn('Form cannot be submitted yet.', $event)">
  Submit
</button>
```

## click

```jsx
       @click="his.pager.hasMore ? loadMoreCouponInfo() : collapse()"
       
        <div class="btn btn--default" @click="$emit('click')">


```

## 自定义事件

```jsx
 this.$emit('inView')
 
   v-on:inView="viewCard"
```

## router

```jsx
    let id = this.$route.params.id

```

## 曝光埋点

```jsx

 listenView() {
      let $container = this.$refs.$container
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target)
            observer.disconnect()
          }
        })
      })
      observer.observe($container)
    },

  <div
                v-for="(item, index) in list"
                :key="'template' + index"
                class="coupon"
                :data-index="index"
                :style="{ background: 'url(' + couponBackground + ')', backgroundSize: '100% 100%' }"
                ref="coupons"
            >

 initMV() {
        Inster()
        let options = {
            root: document.getElementById('coupon-group-campus'),
            rootMargin: '0px',
            threshold: 1.0
        }
        const _this = this
        let observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(function(entry, index) {
                if (entry.isIntersecting) {
                    _this.MV(~~entry.target.dataset.index)
                    observer.unobserve(entry.target)
                }
            })
        }, options)
        this.$refs.coupons.forEach(ele => {
            observer.observe(ele)
        })
    }
```

## fragment
```js
export default {
    name: 'fragment',
    functional: true,
    render(h, ctx) {
        return ctx.children
    }
}

```

## filters
```jsx
export default {
    filters: {
        formatAmount(val) {
            if (val > 0) {
                return val / 100
            }
            return 0
        }
    }
}
import filters from '@/mixins/filters'

@Component({
    mixins: [filters],
    props: {
        drawLotterySecret: {
            type: String,
            default: ''
        }
    }
})

```

## 自定义 v-model
https://www.gingerdoc.com/tutorials/how-to-add-v-model-support-to-custom-vue-js-components
```jsx
<template>
  <input @input="handleInput" />
</template>

<script>
export default {
  prop: ['value'],
  data () {
    return {
      content: this.value
    }
  },
  methods: {
    handleInput (e) {
      this.$emit('input', this.content)
    }
  }
}
</script>

```