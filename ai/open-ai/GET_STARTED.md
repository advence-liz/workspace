# 🎯 立即开始学习 OpenAI API

> 从这里开始你的 OpenAI API 学习之旅！

## 📋 前置要求

- ✅ Node.js 16+ 已安装
- ✅ npm 或 yarn 已安装
- ✅ 有 OpenAI API Key（或准备获取）

## ⚡ 3 步快速开始

### 步骤 1: 安装依赖（1 分钟）

```bash
cd open-ai
npm install
```

### 步骤 2: 配置 API Key（2 分钟）

```bash
# 复制环境变量模板
cp .env.example .env

# 用你喜欢的编辑器打开 .env
# 填入你的 API Key
```

**获取 API Key**:
1. 访问 https://platform.openai.com/api-keys
2. 登录或注册账号
3. 点击 "Create new secret key"
4. 复制密钥到 `.env` 文件

### 步骤 3: 运行第一个示例（30 秒）

```bash
npm run demo:chat
```

你应该看到 AI 的回复！🎉

## 🎓 学习路径

### 🌱 第 1 天：基础入门

**目标**: 理解核心概念，完成第一个 API 调用

1. 阅读 [QUICKSTART.md](./QUICKSTART.md) - 5 分钟
2. 阅读 [docs/01-快速开始.md](./docs/01-快速开始.md) - 15 分钟
3. 运行基础示例：
   ```bash
   npm run demo:chat      # 基础对话
   npm run demo:stream    # 流式响应
   ```
4. 修改 `demos/basic/chat.ts`，尝试不同的提示词

**学习成果**: 
- ✅ 理解 Models、Tokens、Messages 概念
- ✅ 能独立调用 Chat Completions API
- ✅ 知道如何计算成本

### 🌿 第 2-3 天：核心功能

**目标**: 掌握 Chat Completions 的所有功能

1. 阅读 [docs/02-Chat-Completions.md](./docs/02-Chat-Completions.md) - 30 分钟
2. 运行高级示例：
   ```bash
   npm run demo:function  # 函数调用
   ```
3. 实践：创建一个能调用天气 API 的聊天机器人

**学习成果**:
- ✅ 掌握流式响应
- ✅ 理解并使用 Function Calling
- ✅ 能控制输出格式（JSON 模式）

### 🌳 第 4-5 天：向量化与搜索

**目标**: 理解 Embeddings，构建语义搜索

1. 阅读 [docs/03-Embeddings.md](./docs/03-Embeddings.md) - 25 分钟
2. 运行示例：
   ```bash
   npm run demo:embeddings  # 向量化
   npm run demo:rag         # RAG 系统
   ```
3. 实践：为自己的文档构建问答系统

**学习成果**:
- ✅ 理解 Embeddings 原理
- ✅ 能计算文本相似度
- ✅ 能构建简单的 RAG 系统

### 🚀 第 6-7 天：生产环境

**目标**: 学习最佳实践，准备上线

1. 阅读 [docs/08-最佳实践.md](./docs/08-最佳实践.md) - 30 分钟
2. 阅读 [docs/09-错误处理与限流.md](./docs/09-错误处理与限流.md) - 25 分钟
3. 实践：为你的应用添加错误处理和重试机制

**学习成果**:
- ✅ 掌握 Prompt Engineering
- ✅ 实现完善的错误处理
- ✅ 优化成本和性能
- ✅ 准备好上线生产环境

## 🎯 按目标学习

### 我想构建聊天机器人

```bash
# 学习顺序
1. docs/01-快速开始.md
2. docs/02-Chat-Completions.md (重点：流式响应)
3. demos/basic/chat.ts
4. demos/basic/stream.ts
5. docs/08-最佳实践.md (重点：Prompt Engineering)
```

### 我想构建文档问答系统

```bash
# 学习顺序
1. docs/01-快速开始.md
2. docs/03-Embeddings.md
3. demos/basic/embeddings.ts
4. demos/use-cases/rag-system.ts
5. docs/08-最佳实践.md (重点：成本优化)
```

### 我想让 AI 调用工具/API

```bash
# 学习顺序
1. docs/01-快速开始.md
2. docs/02-Chat-Completions.md (重点：函数调用)
3. demos/advanced/function-calling.ts
4. docs/09-错误处理与限流.md
```

### 我想处理图片

```bash
# 学习顺序
1. docs/01-快速开始.md
2. demos/advanced/vision.ts
3. docs/08-最佳实践.md
```

## 💡 学习技巧

### 1. 边学边做
不要只看文档，每学完一个概念就运行对应的示例代码。

### 2. 修改代码
运行示例后，尝试修改参数，观察结果变化：
- 改变 `temperature` 看输出的随机性
- 修改 `max_tokens` 控制长度
- 更换不同的 `model`

### 3. 记录笔记
记录：
- 遇到的错误和解决方法
- 有用的提示词模板
- 成本优化技巧

### 4. 构建项目
学完基础后，立即开始构建一个小项目：
- 个人知识库问答系统
- 代码助手
- 内容生成工具

## 📚 推荐阅读顺序

### 完整学习（推荐）

```
1. QUICKSTART.md (5 分钟)
   ↓
2. docs/01-快速开始.md (15 分钟)
   ↓
3. demos/basic/chat.ts (运行 + 修改)
   ↓
4. docs/02-Chat-Completions.md (30 分钟)
   ↓
5. demos/basic/stream.ts + demos/advanced/function-calling.ts
   ↓
6. docs/03-Embeddings.md (25 分钟)
   ↓
7. demos/use-cases/rag-system.ts
   ↓
8. docs/08-最佳实践.md (30 分钟)
   ↓
9. docs/09-错误处理与限流.md (25 分钟)
   ↓
10. 构建自己的项目！
```

### 快速上手（赶时间）

```
1. QUICKSTART.md
2. demos/basic/chat.ts (运行)
3. docs/02-Chat-Completions.md (浏览重点部分)
4. 开始构建
5. 遇到问题时查阅对应文档
```

## 🆘 遇到问题？

### 常见问题

**Q: API Key 无效**
```
Error: 401 Incorrect API key provided
```
A: 检查 `.env` 文件中的 `OPENAI_API_KEY` 是否正确复制

**Q: 速率限制**
```
Error: 429 Rate limit exceeded
```
A: 等待几秒后重试，或查看 [docs/09-错误处理与限流.md](./docs/09-错误处理与限流.md)

**Q: 网络连接失败**
```
Error: ECONNREFUSED
```
A: 检查网络，国内用户可能需要配置代理

### 获取帮助

1. 查看 [docs/09-错误处理与限流.md](./docs/09-错误处理与限流.md)
2. 查看 [OpenAI 官方文档](https://platform.openai.com/docs)
3. 查看项目 Issues

## 🎁 额外资源

- [OpenAI Cookbook](https://github.com/openai/openai-cookbook) - 官方示例
- [OpenAI Discord](https://discord.gg/openai) - 社区讨论
- [定价计算器](https://openai.com/pricing) - 成本估算

## ✅ 准备好了吗？

现在就开始吧！

```bash
# 安装依赖
npm install

# 配置 API Key
cp .env.example .env
# 编辑 .env 文件

# 运行第一个示例
npm run demo:chat
```

祝学习愉快！🚀

---

**下一步**: 阅读 [QUICKSTART.md](./QUICKSTART.md) 或直接运行示例
