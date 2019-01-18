# 对比和分析几个流行的前端框架

JavaScript 发展历程大概这么个流程 script -> libary -> framework
一开始的关注重点是对 DOM 操作的封装对,BOM 操作的封装,对 JavaScript 语言的补全(数组，字符串，函数)
发展为现在关注重点变为如何快速便捷的开发健壮且易维护的 APP 也就是现在的 MVC or MVVM框架（其一些公共特征见文章尾部）

## knockout

几乎是最早的前端 MVVM 框，`MVVM`最早于 2005 年被微软的 WPF 和 Silverlight 的架构师 John Gossman 提出，并且应用在微软的软件开发中

> 微软出品，使用函数偷龙转凤，最短编辑长度算法实现 DOM 的同步，兼容 IE6，实现高超，但源码极其难读([引用自司徒正美](https://segmentfault.com/q/1010000000307033),说道源码难读其实也还好我当年也就读了半年囧）

```jsx
<div data-bind="visible: myValues().length > 0">
    You will see this message only when 'myValues' has at least one member.
</div>
Today's message is: <span data-bind="text: myMessage"></span>
<div>
    You've clicked <span data-bind="text: numberOfClicks"></span> times
    <button data-bind="click: incrementClickCounter">Click me</button>
</div>

var viewModel = {
  myValues: ko.observableArray([]), // Initially empty, so message hidden
  myMessage: ko.observable(), // Initially blank
  numberOfClicks: ko.observable(0),
  incrementClickCounter: function() {
    var previousCount = this.numberOfClicks()
    this.numberOfClicks(previousCount + 1)
  }
}
viewModel.myValues.push("some value") // Now visible
viewModel.myMessage("Hello, world!") // Text appears
```

### binding&component

```jsx
;<like-widget params="value: userRating" />

ko.components.register("like-widget", {
  viewModel: function(params) {
    // Data: value is either null, 'like', or 'dislike'
    this.chosenValue = params.value

    // Behaviors
    this.like = function() {
      this.chosenValue("like")
    }.bind(this)
    this.dislike = function() {
      this.chosenValue("dislike")
    }.bind(this)
  },
  template: '<div class="like-or-dislike" data-bind="visible: !chosenValue()">\
            <button data-bind="click: like">Like it</button>\
            <button data-bind="click: dislike">Dislike it</button>\
        </div>\
        <div class="result" data-bind="visible: chosenValue">\
            You <strong data-bind="text: chosenValue"></strong> it\
        </div>'
})
```

```jsx
;<div data-bind="yourBindingName: someValue"> </div>

ko.bindingHandlers.yourBindingName = {
  init: function(
    element,
    valueAccessor,
    allBindings,
    viewModel,
    bindingContext
  ) {
    // This will be called when the binding is first applied to an element
    // Set up any initial state, event handlers, etc. here
  },
  update: function(
    element,
    valueAccessor,
    allBindings,
    viewModel,
    bindingContext
  ) {
    // This will be called once when the binding is first applied to an element,
    // and again whenever any observables/computeds that are accessed change
    // Update the DOM element based on the supplied values here.
  }
}
```

## angular

`MVC`至少设计的时候是这样的，不过随着大家广泛使用的更多人都倾向认为它是`MVVM`,后来官方干脆写成`MVW` whatever 你说是啥就是啥

> google 出品，思想来自 flex，IoC， 脏检测，自定义标签，受限于绑定数量，一般不能超过 2000 个，入门容易上手难，大量避不开的概念([引用自司徒正](https://segmentfault.com/q/1010000000307033)）

```xml
<div ng-controller="BoxCtrl">
    <div style="width: 100px; height: 100px; background-color: red;"
         ng-click="click()"></div>
    <p>{{ w }} x {{ h }}</p>
    <p>W: <input type="text" ng-model="w" /></p>
    <p>H: <input type="text" ng-model="h" /></p>
  </div>

```

```js
angular
  .module("app", [], angular.noop)
  .controller("BoxCtrl", function($scope, $element) {
    //$element 就是一个 jQuery 对象
    var e = $element.children().eq(0)
    $scope.w = e.width()
    $scope.h = e.height()

    $scope.click = function() {
      $scope.w = parseInt($scope.w) + 10
      $scope.h = parseInt($scope.h) + 10
    }

    $scope.$watch("w", function(to, from) {
      e.width(to)
    })

    $scope.$watch("h", function(to, from) {
      e.height(to)
    })
  })
```

### directive

```jsx
<p color="red">有颜色的文本</p>
<color color="red">有颜色的文本</color>

var app = angular.module("Demo", [], angular.noop)

app.directive("color", function() {
  var link = function($scope, $element, $attrs) {
    $element.css("color", $attrs.color)
  }
  return { link: link, restrict: "AE" }
})
```

## vue

vue 形式上看起来就是借鉴上俩个框架的思想化为己用，并将其整合简化，是一个非常易上手的作品（vue viewmodel 计算属性看起来就是借鉴了knockout，组件的的封装和绑定语法看起来就是借鉴了angular）

> 使用 Object.defineProperties 实现同步，实现精致，但功能薄弱([引用自司徒正美](https://segmentfault.com/q/1010000000307033)关于功能薄弱如尤雨溪最开始的构想 Vue.js 是一个用来开发 web 界面的前端库那确实功能不强，但是随着 vue 生态的发展现在也是很强大的）

```xml
<div id="app">
  <div v-bind:class="{ active: isActive }"></div>
  <div v-bind:style="{ color: activeColor, fontSize: fontSize + 'px' }"></div>
   <input v-model="newTodo" v-on:keyup.enter="addTodo">
  <ul>
    <li v-for="todo in todos">
      <span>{{ todo.text }}</span>
      <button v-on:click="removeTodo($index)">X</button>
    </li>
  </ul>
</div>
```

```js
new Vue({
  el: "#app",
  data: {
    newTodo: "",
    todos: [{ text: "Add some todos" }]
  },
  methods: {
    addTodo: function() {
      var text = this.newTodo.trim()
      if (text) {
        this.todos.push({ text: text })
        this.newTodo = ""
      }
    },
    removeTodo: function(index) {
      this.todos.splice(index, 1)
    }
  }
})
```

### 自定义指令

```jsx
;<div id="components-demo">
  <button-counter />
</div>

// Define a new component called button-counter
Vue.component("button-counter", {
  data: function() {
    return {
      count: 0
    }
  },
  template:
    '<button v-on:click="count++">You clicked me {{ count }} times.</button>'
})
```

## react

`ko`,`angular`,`vue` 或多或少都跟 DOM Tree 有着暧昧的关系

而`react`完全就是打开的新世界的大门，React 以 JavaScript 为中心,一个 JSX element 就是一个 JavaScript 对象，你能对 “对象”做什么，你就可以对 JSX 做什么

## 综合对比

| 框架    | 兼容性 | DOMtree | 双向绑定      | 上手难度&学习曲线  | 组件化 | 综述 
| ------- | ------ | --------------- | ------------- | ----------------- | ----------------- | ------------- |
| ko | ie6+   | 暧昧  | 支持 依赖收集 | 上手容易学习曲线感觉不是那么友好  | 不是很理想基本靠自觉 |  通过巧妙利用函数构建观察者模式实现  双向绑定，开创先河浏览器兼容性上无可匹敌 |
| vue | ie9+   | 1.x 版本还是暧昧的,2.x之后支持虚拟dom基本就不爱了| 支持 依赖收集 | 上手容易 学习曲线应该是最友好的   | 组件化比较方便   | 得易于 ECMASCRIPT 新的 API Object.defineProperties，更便捷高效的实现  双向绑定，使用是最容易的上手的
| angular | ie8+   | 暧昧 | 支持 脏检测   | 上手容易  学习曲线最陡峭深入难概念太多  | 组件化能力也还可以 | 跟其他几个相比只有 angular 才能说是真正的框架，你想要的功能应有尽有，就连模块化都自己处理了，react 和 vue 如何不加上自己生态系统只是一个优秀前端界面库 |
| react   | ie9+| 分手了| 不支持 | 上手容易 学习曲线这个我觉得不太好描述上限也高下限也低完全看你对编程语言的理解 |  组件化能力强，大大的提高的组件化的下限，你写的代码只能是不理想的组件化或者组件化的代码 |

- [框架对比其实不是那么好读如果没读过源码的话](http://www.cnblogs.com/sskyy/p/3709740.html)
- [性能对比分析如果不看点框架原理看性能分析貌似有些空洞](https://www.zhihu.com/question/31809713/answer/53544875)

## 现在的前端框架一般具有的特征

- 操作 DOM 属性 如：class ,disabled
- 操作表单素 checkbox radio input ...
- 列表渲染
- 对浏览器事件处理机制的一个封装，自动处理一些兼容问题
- 上下文管理一般都会一定程度依赖 DOM 结构（得到一种父子关系进而提供一种父子间的通信方式），提供一个作用域划分方式
- 组件化 组件间通信
- 生命周期
