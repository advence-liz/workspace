# 📁 项目结构说明

## 目录树

```
open-ai/
├── README.md                    # 项目总览与学习路径
├── QUICKSTART.md                # 5 分钟快速开始指南
├── PROJECT_STRUCTURE.md         # 本文件 - 项目结构说明
│
├── package.json                 # 依赖与脚本配置
├── tsconfig.json                # TypeScript 配置
├── .env.example                 # 环境变量模板
├── .gitignore                   # Git 忽略配置
│
├── docs/                        # 📚 详细文档
│   ├── 01-快速开始.md           # 环境配置与第一个 API 调用
│   ├── 02-Chat-Completions.md   # 对话 API 详解
│   ├── 03-Embeddings.md         # 文本向量化与语义搜索
│   ├── 04-Fine-tuning.md        # 模型微调（待创建）
│   ├── 05-Assistants-API.md     # AI 助手（待创建）
│   ├── 06-Vision.md             # 图像理解（待创建）
│   ├── 07-Audio.md              # 语音处理（待创建）
│   ├── 08-最佳实践.md           # 生产环境优化
│   └── 09-错误处理与限流.md     # 错误处理与速率限制
│
├── demos/                       # 💻 代码示例
│   ├── index.ts                 # 示例列表
│   │
│   ├── basic/                   # 基础示例
│   │   ├── chat.ts              # 基础对话
│   │   ├── stream.ts            # 流式响应
│   │   └── embeddings.ts        # 文本向量化
│   │
│   ├── advanced/                # 高级示例
│   │   ├── function-calling.ts  # 函数调用
│   │   ├── vision.ts            # 图像理解
│   │   ├── audio.ts             # 语音处理（待创建）
│   │   └── assistant.ts         # AI 助手（待创建）
│   │
│   └── use-cases/               # 实际应用场景
│       ├── rag-system.ts        # RAG 文档问答系统
│       ├── chatbot.ts           # 智能客服（待创建）
│       └── code-assistant.ts    # 代码助手（待创建）
│
└── node_modules/                # 依赖包（不提交到 Git）
```

## 📄 文件说明

### 根目录文件

| 文件 | 说明 |
|------|------|
| `README.md` | 项目主文档，包含完整的学习路径和功能概览 |
| `QUICKSTART.md` | 快速开始指南，5 分钟内完成第一个 API 调用 |
| `package.json` | NPM 包配置，包含所有依赖和运行脚本 |
| `tsconfig.json` | TypeScript 编译配置 |
| `.env.example` | 环境变量模板，需要复制为 `.env` 并填入 API Key |
| `.gitignore` | Git 忽略配置，防止敏感信息泄露 |

### 文档目录 (`docs/`)

系统性学习文档，按难度递进：

1. **01-快速开始.md** - 配置环境，理解核心概念
2. **02-Chat-Completions.md** - 最重要的 API，包含对话、流式、函数调用
3. **03-Embeddings.md** - 文本向量化，实现语义搜索
4. **08-最佳实践.md** - Prompt Engineering、安全性、成本优化
5. **09-错误处理与限流.md** - 生产环境必备的错误处理和重试机制

### 示例目录 (`demos/`)

#### `basic/` - 基础示例

| 文件 | 说明 | 运行命令 |
|------|------|---------|
| `chat.ts` | 最简单的对话示例 | `npm run demo:chat` |
| `stream.ts` | 流式响应（打字机效果） | `npm run demo:stream` |
| `embeddings.ts` | 文本向量化与相似度计算 | `npm run demo:embeddings` |

#### `advanced/` - 高级示例

| 文件 | 说明 | 运行命令 |
|------|------|---------|
| `function-calling.ts` | AI 调用自定义函数 | `npm run demo:function` |
| `vision.ts` | 图像理解与分析 | `npm run demo:vision` |

#### `use-cases/` - 实际应用

| 文件 | 说明 | 运行命令 |
|------|------|---------|
| `rag-system.ts` | 完整的 RAG 文档问答系统 | `npm run demo:rag` |

## 🚀 使用流程

### 1. 初学者路径

```bash
# 1. 安装依赖
npm install

# 2. 配置 API Key
cp .env.example .env
# 编辑 .env，填入 OPENAI_API_KEY

# 3. 阅读快速开始
# 查看 QUICKSTART.md

# 4. 运行第一个示例
npm run demo:chat

# 5. 学习核心概念
# 阅读 docs/01-快速开始.md
# 阅读 docs/02-Chat-Completions.md
```

### 2. 进阶路径

```bash
# 1. 学习流式响应
npm run demo:stream

# 2. 学习函数调用
npm run demo:function

# 3. 学习文本向量化
npm run demo:embeddings

# 4. 学习图像理解
npm run demo:vision
```

### 3. 实战路径

```bash
# 1. 运行 RAG 系统
npm run demo:rag

# 2. 修改代码，添加自己的文档
# 编辑 demos/use-cases/rag-system.ts

# 3. 阅读最佳实践
# 查看 docs/08-最佳实践.md

# 4. 学习错误处理
# 查看 docs/09-错误处理与限流.md
```

## 📦 依赖说明

### 核心依赖

```json
{
  "openai": "^4.73.0",    // OpenAI 官方 SDK
  "dotenv": "^16.4.7",    // 环境变量管理
  "zod": "^3.24.1"        // 运行时类型验证
}
```

### 开发依赖

```json
{
  "typescript": "^5.7.2", // TypeScript 编译器
  "tsx": "^4.19.2",       // 直接运行 TS 文件
  "ts-node": "^10.9.2",   // Node.js TS 运行时
  "@types/node": "^22.10.2" // Node.js 类型定义
}
```

## 🎯 NPM 脚本

| 命令 | 说明 |
|------|------|
| `npm run demo:list` | 查看所有可用示例 |
| `npm run demo:chat` | 运行基础聊天示例 |
| `npm run demo:stream` | 运行流式响应示例 |
| `npm run demo:function` | 运行函数调用示例 |
| `npm run demo:embeddings` | 运行向量化示例 |
| `npm run demo:vision` | 运行图像理解示例 |
| `npm run demo:rag` | 运行 RAG 系统示例 |
| `npm run type-check` | 类型检查（不编译） |

## 🔐 环境变量

`.env` 文件配置：

```bash
# 必需
OPENAI_API_KEY=sk-proj-xxxxx

# 可选：Azure OpenAI
# AZURE_OPENAI_API_KEY=your_azure_key
# AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com

# 可选：代理配置（国内用户）
# HTTP_PROXY=http://127.0.0.1:7890
# HTTPS_PROXY=http://127.0.0.1:7890
```

## 📝 添加新示例

### 1. 创建文件

```bash
# 基础示例
touch demos/basic/your-demo.ts

# 高级示例
touch demos/advanced/your-demo.ts

# 应用场景
touch demos/use-cases/your-demo.ts
```

### 2. 编写代码

```typescript
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function yourDemo() {
  // 你的代码
}

yourDemo();
```

### 3. 添加 NPM 脚本

编辑 `package.json`：

```json
{
  "scripts": {
    "demo:your-demo": "node --loader ts-node/esm demos/basic/your-demo.ts"
  }
}
```

### 4. 更新文档

在 `README.md` 中添加示例说明。

## 🔗 相关资源

- [README.md](./README.md) - 项目主文档
- [QUICKSTART.md](./QUICKSTART.md) - 快速开始
- [OpenAI 官方文档](https://platform.openai.com/docs)

## 💡 提示

- 所有示例都可以直接运行，无需额外配置
- 修改代码后直接重新运行即可看到效果
- 遇到问题查看 [错误处理文档](./docs/09-错误处理与限流.md)
- 生产环境部署前务必阅读 [最佳实践](./docs/08-最佳实践.md)
