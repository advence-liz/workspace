#!/bin/bash

# Chrome 扩展打包脚本

VERSION=$(grep '"version"' manifest.json | head -1 | sed 's/.*: "\(.*\)".*/\1/')
NAME="ad-blocker-extension"
OUTPUT_DIR="../dist"

echo "========================================"
echo "  Chrome 扩展打包工具"
echo "  版本: $VERSION"
echo "========================================"

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

# 清理旧文件
if [ -f "$OUTPUT_DIR/$NAME-v$VERSION.zip" ]; then
    echo "🗑️  删除旧版本..."
    rm "$OUTPUT_DIR/$NAME-v$VERSION.zip"
fi

# 打包文件
echo "📦 正在打包..."
cd ..
zip -r "$OUTPUT_DIR/$NAME-v$VERSION.zip" chrome-extension \
    -x "*/.git/*" \
    -x "*/.DS_Store" \
    -x "*/node_modules/*" \
    -x "*/build.sh" \
    -x "*/INSTALL.md" \
    -x "*/README.md"

# 检查是否成功
if [ -f "$OUTPUT_DIR/$NAME-v$VERSION.zip" ]; then
    SIZE=$(du -h "$OUTPUT_DIR/$NAME-v$VERSION.zip" | cut -f1)
    echo ""
    echo "✅ 打包成功！"
    echo "📁 输出文件: $OUTPUT_DIR/$NAME-v$VERSION.zip"
    echo "📊 文件大小: $SIZE"
    echo ""
    echo "下一步:"
    echo "  1. 上传到 Chrome Web Store"
    echo "  2. 或在 chrome://extensions/ 中加载"
else
    echo "❌ 打包失败"
    exit 1
fi
