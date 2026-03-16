# 🎉 欢迎来到 OpenAI API 学习项目！

> **这是一个系统性学习 OpenAI API 的完整教程项目**

## 🚀 立即开始（3 分钟）

```bash
# 1. 安装依赖
npm install

# 2. 配置 API Key
cp .env.example .env
# 编辑 .env，填入你的 OPENAI_API_KEY

# 3. 运行第一个示例
npm run demo:chat
```

**就这么简单！** 🎉

## 📚 项目包含什么？

### ✅ 5 篇详细文档（25,000+ 字）

- **快速开始** - 环境配置与核心概念
- **Chat Completions** - 对话、流式、函数调用
- **Embeddings** - 向量化与语义搜索
- **最佳实践** - Prompt Engineering、安全性、优化
- **错误处理** - 重试机制、速率限制

### ✅ 7 个可运行示例（2,000+ 行代码）

- 基础对话
- 流式响应
- 函数调用
- 文本向量化
- 图像理解
- RAG 文档问答系统
- ...更多

### ✅ 完整的项目配置

- TypeScript 配置
- 环境变量管理
- NPM 脚本
- 代码规范

## 🎯 我应该从哪里开始？

### 🌱 完全新手（从未用过 OpenAI API）

**👉 从这里开始**: [GET_STARTED.md](./GET_STARTED.md)

这个文档会带你：
- 3 步完成环境配置
- 运行第一个示例
- 按天制定学习计划

### 🌿 有一点经验（用过 ChatGPT API）

**👉 从这里开始**: [QUICKSTART.md](./QUICKSTART.md)

快速回顾基础，然后直接进入高级功能：
- 函数调用
- Embeddings
- 最佳实践

### 🌳 经验丰富（想查阅特定功能）

**👉 直接查看**:
- [项目结构](./PROJECT_STRUCTURE.md) - 了解所有文件
- [文档目录](./docs/) - 查找特定主题
- [示例代码](./demos/) - 复制粘贴使用

## 📖 推荐学习路径

### 路径 1: 系统学习（7 天计划）

```
第 1 天: 基础入门
  → GET_STARTED.md
  → docs/01-快速开始.md
  → demos/basic/chat.ts

第 2-3 天: 核心功能
  → docs/02-Chat-Completions.md
  → demos/basic/stream.ts
  → demos/advanced/function-calling.ts

第 4-5 天: 向量化与搜索
  → docs/03-Embeddings.md
  → demos/basic/embeddings.ts
  → demos/use-cases/rag-system.ts

第 6-7 天: 生产环境
  → docs/08-最佳实践.md
  → docs/09-错误处理与限流.md
  → 构建自己的项目
```

### 路径 2: 快速上手（1 小时）

```
1. QUICKSTART.md (5 分钟)
2. 运行所有示例 (20 分钟)
   npm run demo:chat
   npm run demo:stream
   npm run demo:function
   npm run demo:rag
3. 浏览 docs/02-Chat-Completions.md (30 分钟)
4. 开始构建 (5 分钟)
```

## 🎓 按目标学习

| 我想做... | 推荐阅读 | 推荐示例 |
|----------|---------|---------|
| 🤖 聊天机器人 | 02-Chat-Completions.md | chat.ts, stream.ts |
| 📚 文档问答 | 03-Embeddings.md | embeddings.ts, rag-system.ts |
| 🔧 工具调用 | 02-Chat-Completions.md (函数调用) | function-calling.ts |
| 🖼️ 图像理解 | - | vision.ts |
| 🚀 生产部署 | 08-最佳实践.md, 09-错误处理.md | 所有示例 |

## 💡 快速命令参考

```bash
# 查看所有示例
npm run demo:list

# 运行基础示例
npm run demo:chat         # 基础对话
npm run demo:stream       # 流式响应
npm run demo:embeddings   # 文本向量化

# 运行高级示例
npm run demo:function     # 函数调用
npm run demo:vision       # 图像理解

# 运行实际应用
npm run demo:rag          # RAG 文档问答系统
```

## 📁 项目结构速览

```
open-ai/
├── 00-START-HERE.md        ← 你在这里！
├── GET_STARTED.md           ← 新手从这里开始
├── QUICKSTART.md            ← 5 分钟快速开始
├── README.md                ← 项目总览
│
├── docs/                    ← 详细文档
│   ├── 01-快速开始.md
│   ├── 02-Chat-Completions.md
│   ├── 03-Embeddings.md
│   ├── 08-最佳实践.md
│   └── 09-错误处理与限流.md
│
├── demos/                   ← 代码示例
│   ├── basic/              ← 基础示例
│   ├── advanced/           ← 高级示例
│   └── use-cases/          ← 实际应用
│
└── package.json            ← 依赖与脚本
```

## ❓ 常见问题

### Q: 我需要什么前置知识？

A: 基础的 JavaScript/TypeScript 知识即可。项目中有详细的注释和说明。

### Q: 需要付费吗？

A: OpenAI API 需要付费，但有免费额度。新用户通常有 $5 的免费额度，足够学习使用。

### Q: 国内能用吗？

A: 可以，但需要：
1. 能访问 OpenAI 网站（可能需要代理）
2. 国际信用卡（或使用虚拟卡）

### Q: 学完需要多长时间？

A: 
- 快速上手: 1 小时
- 基础掌握: 2-3 天
- 完全掌握: 1 周

### Q: 代码可以直接用于生产吗？

A: 示例代码主要用于学习。生产环境请参考 `docs/08-最佳实践.md` 和 `docs/09-错误处理与限流.md`。

## 🆘 需要帮助？

1. **查看文档**: [docs/](./docs/) 目录
2. **查看示例**: [demos/](./demos/) 目录
3. **常见错误**: [docs/09-错误处理与限流.md](./docs/09-错误处理与限流.md)
4. **官方文档**: https://platform.openai.com/docs

## 🎯 下一步行动

### ✅ 准备开始了？

**👉 点击这里**: [GET_STARTED.md](./GET_STARTED.md)

### ✅ 想快速上手？

**👉 点击这里**: [QUICKSTART.md](./QUICKSTART.md)

### ✅ 想了解项目全貌？

**👉 点击这里**: [README.md](./README.md)

---

## 📊 项目统计

- ✅ **10** 篇文档
- ✅ **7** 个代码示例
- ✅ **25,000+** 字详细说明
- ✅ **2,000+** 行示例代码
- ✅ **100%** 可运行

---

**准备好了吗？开始你的 OpenAI API 学习之旅吧！** 🚀

👉 **[点击这里开始](./GET_STARTED.md)**
