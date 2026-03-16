# 🤝 贡献指南

感谢你对本项目的关注！这是一个学习项目，欢迎贡献。

## 🎯 可以贡献什么

- 📝 改进文档（修正错误、补充说明）
- 💻 添加新的示例代码
- 🐛 修复 Bug
- ✨ 添加新功能
- 🌍 翻译文档

## 📋 贡献流程

### 1. Fork 项目

点击右上角的 Fork 按钮

### 2. Clone 到本地

```bash
git clone https://github.com/YOUR_USERNAME/workspace.git
cd workspace/ai/open-ai
```

### 3. 创建分支

```bash
git checkout -b feature/your-feature-name
```

### 4. 进行修改

- 遵循现有的代码风格
- 添加必要的注释
- 确保代码可以运行

### 5. 测试

```bash
# 安装依赖
npm install

# 运行示例确保正常
npm run demo:chat
npm run demo:stream
```

### 6. 提交

```bash
git add .
git commit -m "feat: 添加 XXX 功能"
```

提交信息格式：
- `feat: 新功能`
- `fix: 修复 Bug`
- `docs: 文档更新`
- `style: 代码格式`
- `refactor: 重构`

### 7. 推送

```bash
git push origin feature/your-feature-name
```

### 8. 创建 Pull Request

在 GitHub 上创建 PR，描述你的改动。

## 📝 代码规范

### TypeScript 风格

```typescript
// ✅ 好的
async function fetchData(id: string): Promise<Data> {
  const response = await api.get(id);
  return response.data;
}

// ❌ 不好的
function fetchData(id) {
  return api.get(id).then(r => r.data);
}
```

### 注释规范

```typescript
/**
 * 函数说明
 * @param param1 - 参数说明
 * @returns 返回值说明
 */
async function example(param1: string): Promise<Result> {
  // 实现
}
```

### 文档规范

- 使用中文
- 代码示例要完整可运行
- 包含输入输出示例
- 添加相关链接

## 🎨 添加新示例

### 1. 选择合适的目录

- `demos/basic/` - 基础示例
- `demos/advanced/` - 高级示例
- `demos/use-cases/` - 实际应用

### 2. 文件模板

```typescript
/**
 * 示例标题
 * 简短描述
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  console.log('🚀 示例开始\n');

  try {
    // 你的代码

    console.log('\n✅ 完成');
  } catch (error: any) {
    console.error('❌ 错误:', error.message);
  }
}

main();
```

### 3. 添加文档

在对应的 `docs/` 文件中添加说明。

### 4. 更新 README

在 `README.md` 中添加示例链接。

## 📚 添加新文档

### 1. 文档结构

```markdown
# 标题

> 简短描述

## 📝 概述

## 🎯 基础用法

## 🔧 高级用法

## 💡 实用技巧

## 🔗 下一步

## 📚 参考资料
```

### 2. 代码示例

- 完整可运行
- 包含错误处理
- 添加注释说明

### 3. 链接

- 链接到相关文档
- 链接到示例代码
- 链接到官方文档

## ❓ 问题反馈

遇到问题？

1. 查看 [文档](./docs/)
2. 查看 [FAQ](./README.md#常见问题)
3. 提交 Issue

## 📄 许可证

本项目采用 MIT 许可证。

---

再次感谢你的贡献！🎉
