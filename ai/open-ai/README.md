# OpenAI API 学习指南

> 系统性学习 OpenAI API 的完整教程与示例代码

## 📚 目录结构

```
open-ai/
├── README.md                 # 本文件 - 项目总览
├── docs/                     # 详细文档
│   ├── 01-快速开始.md
│   ├── 02-Chat-Completions.md
│   ├── 03-Embeddings.md
│   ├── 04-Fine-tuning.md
│   ├── 05-Assistants-API.md
│   ├── 06-Vision.md
│   ├── 07-Audio.md
│   ├── 08-最佳实践.md
│   └── 09-错误处理与限流.md
├── demos/                    # 代码示例
│   ├── basic/               # 基础示例
│   ├── advanced/            # 高级示例
│   └── use-cases/           # 实际应用场景
├── package.json
└── .env.example
```

## 🚀 快速开始

### 1. 安装依赖

```bash
cd open-ai
npm install
```

### 2. 配置 API Key

```bash
cp .env.example .env
# 编辑 .env 文件，填入你的 OpenAI API Key
```

### 3. 运行示例

```bash
# 基础聊天示例
npm run demo:chat

# 流式响应示例
npm run demo:stream

# 函数调用示例
npm run demo:function

# 查看所有可用示例
npm run demo:list
```

## 📖 学习路径

### 🌱 初学者路径
1. [快速开始](./docs/01-快速开始.md) - 环境配置与第一个 API 调用
2. [Chat Completions](./docs/02-Chat-Completions.md) - 核心对话 API
3. [错误处理与限流](./docs/09-错误处理与限流.md) - 生产环境必备

### 🌿 进阶路径
4. [Embeddings](./docs/03-Embeddings.md) - 文本向量化与语义搜索
5. [Vision](./docs/06-Vision.md) - 图像理解
6. [Audio](./docs/07-Audio.md) - 语音转文字与文字转语音

### 🌳 高级路径
7. [Fine-tuning](./docs/04-Fine-tuning.md) - 模型微调
8. [Assistants API](./docs/05-Assistants-API.md) - 构建 AI 助手
9. [最佳实践](./docs/08-最佳实践.md) - 性能优化与成本控制

## 🎯 核心功能概览

| 功能 | 说明 | 文档 | 示例 |
|------|------|------|------|
| **Chat Completions** | 对话生成（核心功能） | [文档](./docs/02-Chat-Completions.md) | [示例](./demos/basic/chat.ts) |
| **Streaming** | 流式响应 | [文档](./docs/02-Chat-Completions.md#流式响应) | [示例](./demos/basic/stream.ts) |
| **Function Calling** | 函数调用 | [文档](./docs/02-Chat-Completions.md#函数调用) | [示例](./demos/advanced/function-calling.ts) |
| **Embeddings** | 文本向量化 | [文档](./docs/03-Embeddings.md) | [示例](./demos/basic/embeddings.ts) |
| **Vision** | 图像理解 | [文档](./docs/06-Vision.md) | [示例](./demos/advanced/vision.ts) |
| **Audio** | 语音处理 | [文档](./docs/07-Audio.md) | [示例](./demos/advanced/audio.ts) |
| **Assistants** | AI 助手 | [文档](./docs/05-Assistants-API.md) | [示例](./demos/advanced/assistant.ts) |

## 💡 实际应用场景

在 `demos/use-cases/` 目录下提供了完整的应用场景示例：

- **智能客服** - 基于 Function Calling 的客服系统
- **文档问答** - 基于 Embeddings 的 RAG 系统
- **代码助手** - 代码生成与解释
- **内容生成器** - 批量内容创作
- **多模态应用** - 图文理解与生成

## 🔧 技术栈

- **TypeScript** - 类型安全
- **openai (官方 SDK)** - v4.x
- **dotenv** - 环境变量管理
- **zod** - 运行时类型验证

## 📝 注意事项

1. **API Key 安全**：永远不要将 API Key 提交到代码仓库
2. **速率限制**：注意 OpenAI 的速率限制，避免超限
3. **成本控制**：使用 `max_tokens` 限制响应长度，控制成本
4. **错误处理**：生产环境必须实现完善的错误处理和重试机制

## 🔗 相关资源

- [OpenAI 官方文档](https://platform.openai.com/docs)
- [OpenAI Node.js SDK](https://github.com/openai/openai-node)
- [OpenAI Cookbook](https://github.com/openai/openai-cookbook)
- [定价信息](https://openai.com/pricing)

## 📄 许可证

MIT

---

**开始学习**: 建议从 [快速开始](./docs/01-快速开始.md) 开始 🚀
