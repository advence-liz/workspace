# 图标文件说明

## Logo 设计

采用**甜美风美短加白猫咪**卡通形象：

| 特征 | 设计要点 |
|------|----------|
| **脸型** | 圆润包子脸，更可爱 |
| **眼睛** | 超大圆眼，多重高光，呆萌感 |
| **腮红** | 大面积粉色晕染，甜美度 MAX |
| **毛色** | 柔和银灰 + 纯白，M字开脸 |
| **鼻子** | 粉嫩小爱心鼻 |
| **嘴巴** | W形微笑，微吐小舌头 |
| **耳朵** | 圆润三角，粉色内侧 |
| **装饰** | 头顶星星+禁止符号，金色星星点缀 |

## 文件结构

| 文件 | 尺寸 | 用途 |
|------|------|------|
| icon.svg | 矢量 | 源文件，可缩放 |
| icon16.png | 16x16 | 工具栏图标 |
| icon32.png | 32x32 | 扩展管理页面 |
| icon48.png | 48x48 | 扩展详情页面 |
| icon128.png | 128x128 | Chrome 商店 |

## 生成图标

```bash
cd icons
./create-icons.sh
```

或手动转换：

```bash
magick convert -background none -resize 128x128 icon.svg icon128.png
```

## 在线转换工具

1. [CloudConvert](https://cloudconvert.com/svg-to-png)
2. [SVG to PNG](https://svgtopng.com/)
