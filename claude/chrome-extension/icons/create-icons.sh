#!/bin/bash
# 创建卡通人物 SVG 图标并转换为 PNG

echo "Generating PNG icons from icon.svg..."

# 生成各尺寸的 PNG 图标
magick convert -background none -resize 16x16 icon.svg icon16.png
magick convert -background none -resize 32x32 icon.svg icon32.png
magick convert -background none -resize 48x48 icon.svg icon48.png
magick convert -background none -resize 128x128 icon.svg icon128.png

echo "All icons generated successfully:"
echo "  - icon16.png (16x16)"
echo "  - icon32.png (32x32)"
echo "  - icon48.png (48x48)"
echo "  - icon128.png (128x128)"
