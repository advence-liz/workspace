# 实习生面试

一般就问一下面的问题

- 对闭包的理解
- css 选择器权重
- this
- 数组去重

## 推荐两个链接

- https://www.cnblogs.com/wdlhao/p/8290436.html#_label1
- https://segmentfault.com/a/1190000015162142

## 题的话没多少就下面那些吧

### 变量作用域

```js
var f = true;
if (f === true) {
  var a = 10;
}

function fn() {
  var b = 20;
  c = 30;
}

fn();
console.log(a);
console.log(b);
console.log(c);


var foo = 1;
function(){
    console.log(foo);
    var foo = 2;
    console.log(foo);
}
```

### 闭包

```js
// 先问下面的输出结果都是 3
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i)
  }, 0)
}
// 然后再问如何输出 0 1 2
for (var i = 0; i < 3; i++) {
  ;(function(i) {
    setTimeout(function() {
      console.log(i)
    }, 0)
  })(i)
}
```

### 值类型引用类型

```js
var a = new Object()
a.value = 1
b = a
b.value = 2
alert(a.value)
```
