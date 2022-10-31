## tab
```css
.pro-tab__bar-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    position: relative;
    width: 100%;
    z-index: 1;
    transition: transform .3s cubic-bezier(.35,0,.25,1),-webkit-transform .3s cubic-bezier(.35,0,.25,1);
    will-change: transform;
    overflow: hidden;
    overflow-x: scroll;
}

.pro-tab__bar-tab {
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    position: relative;
    flex-direction: column;
    padding: 15px;
    font-size: 20px;
}
```
## background-image
```css

https://p1.meituan.net/travelcube/816ce6c078667f6af6fa90e4146abd88272.png  
background: url(https://p1.meituan.net/travelcube/816ce6c078667f6af6fa90e4146abd88272.png@60w_60h_80q);
background-size: 100% 100%;

```
## 横向滚动

```css
// parent
    white-space: nowrap;
    overflow: scroll;
    overflow-y: hidden;
// child    
    display: inline-block;
    
// parent
    display: flex;
    flex-wrap: nowrap;
// child
    flex-shrink: 0;
       
```

## 取消滚动条
```css
&::-webkit-scrollbar {
        display: none; /* Chrome Safari */
    }
```

## underline 

```scss
@mixin underline($color: #eee) {
  position: relative;
  &::after {
    content: '';
    position: absolute;
    background-color: $color;
    display: block;
    z-index: 1;
    top: auto;
    right: auto;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    transform-origin: 50% 100%;
    transform: scaleY(0.5);
  }
}


&__title {
    height: 100px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    @include underline;
  }
  
  
    &:not(:last-child) {
    @include underline;
  }
```
## set line

```less
.setTopLine(@c: #D8D8D8) {
  position: relative;
  border: none;
  &::after {
    content: " ";
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    height: 1px;
    border-top: 1px solid @c;
    transform: scaleY(0.5);
    color: @c;
  }
}

.setBottomLine(@c: #D8D8D8) {
  position: relative;
  border: none;
  &::after {
    content: " ";
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    height: 1px;
    border-bottom: 1px solid @c;
    transform: scaleY(0.5);
    color: @c;
  }
}

.setLeftLine(@c: #D8D8D8) {
  position: relative;
  border: none;
  &::after {
    content: " ";
    position: absolute;
    left: 0;
    top: 0;
    width: 1px;
    bottom: 0;
    border-left: 1px solid @c;
    transform: scaleX(0.5);
    color: @c;
  }
}

.setRightLine(@c: #D8D8D8) {
  position: relative;
  border: none;
  &::after {
    content: " ";
    position: absolute;
    right: 0;
    top: 0;
    width: 1px;
    bottom: 0;
    border-right: 1px solid @c;
    transform: scaleX(0.5);
    color: @c;
  }
}

.setAllLine(@radius:0,@color:#D8D8D8) {
  position: relative;
  border: none;

  border-radius: @radius;
  &::after {
    content: " ";
    pointer-events: none;
    position: absolute;
    // z-index: 0;
    top: 0;
    left: 0;
    border-radius: @radius;
    transform-origin: left top;
    // box-sizing: border-box;
    border: 1px solid @color;
    width: 100%;
    height: 100%;
    @media (-webkit-min-device-pixel-ratio: 2) and (-webkit-max-device-pixel-ratio: 2.99) {
      width: 200%;
      height: 200%;
      transform: scale(0.5);
    }
    @media (-webkit-min-device-pixel-ratio: 3) {
      width: 300%;
      height: 300%;
      transform: scale(0.33333);
    }
  }
}
```
## 文本超出省略号

```scss

/**
 * NOTE 多行文本时，line-height 需设置 1.2em 以上，否则微信中显示不正常
 */
@mixin ellipsis($line: 1) {
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;

    @if $line == 1 {
        white-space: nowrap;
    } @else {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: $line;
        word-break: break-all;
    }
}

```

## iphoneX 适配

```scss
/* iphoneX 顶部适配 */
@mixin iphone-x-top {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}

/* iphoneX 底部适配 */
@mixin iphone-x-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

```

## 引入字体文件

```css
@font-face {
  font-family: 'MyWebFont';
  src: url('webfont.eot'); /* IE9 Compat Modes */
  src: url('webfont.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
       url('webfont.woff2') format('woff2'), /* Super Modern Browsers */
       url('webfont.woff') format('woff'), /* Pretty Modern Browsers */
       url('webfont.ttf')  format('truetype'), /* Safari, Android, iOS */
       url('webfont.svg#svgFontName') format('svg'); /* Legacy iOS */
       url('https://sIN-Medium_1.ttf') format('opentype')
}
```