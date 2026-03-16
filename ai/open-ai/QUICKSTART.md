# 🚀 5 分钟快速开始

> 快速上手 OpenAI API

## 第一步：安装依赖

```bash
cd open-ai
npm install
```

## 第二步：配置 API Key

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入你的 API Key
# OPENAI_API_KEY=sk-proj-your_key_here
```

**获取 API Key**: 访问 [OpenAI Platform](https://platform.openai.com/api-keys)

## 第三步：运行第一个示例

```bash
npm run demo:chat
```

你应该看到类似的输出：

```
🤖 基础聊天示例

📝 AI 回复: TypeScript 是 JavaScript 的超集，为 JavaScript 添加了静态类型系统。

📊 Token 使用统计:
   输入: 45 tokens
   输出: 28 tokens
   总计: 73 tokens
   成本: $0.000146
```

## 第四步：尝试更多示例

```bash
# 流式响应（打字机效果）
npm run demo:stream

# 函数调用
npm run demo:function

# 文本向量化
npm run demo:embeddings

# RAG 文档问答系统
npm run demo:rag
```

## 第五步：修改代码

打开 `demos/basic/chat.ts`，修改提示词：

```typescript
{
  role: 'user',
  content: '你的问题', // 改成你想问的问题
}
```

然后重新运行：

```bash
npm run demo:chat
```

## 🎯 接下来做什么？

### 学习路径

1. **初学者**
   - [快速开始](./docs/01-快速开始.md) - 详细的入门教程
   - [Chat Completions](./docs/02-Chat-Completions.md) - 核心 API

2. **进阶**
   - [Embeddings](./docs/03-Embeddings.md) - 文本向量化
   - [Vision](./docs/06-Vision.md) - 图像理解

3. **生产环境**
   - [最佳实践](./docs/08-最佳实践.md) - 优化技巧
   - [错误处理](./docs/09-错误处理与限流.md) - 健壮性

### 实际应用

查看 `demos/use-cases/` 目录：

- **RAG 系统** (`rag-system.ts`) - 文档问答
- **智能客服** - 基于函数调用
- **代码助手** - 代码生成与解释

## ⚠️ 常见问题

### API Key 无效

```
Error: 401 Incorrect API key provided
```

**解决**：检查 `.env` 文件中的 `OPENAI_API_KEY` 是否正确。

### 速率限制

```
Error: 429 Rate limit exceeded
```

**解决**：
- 降低请求频率
- 等待几秒后重试
- 查看 [速率限制文档](https://platform.openai.com/docs/guides/rate-limits)

### 网络连接失败

```
Error: ECONNREFUSED
```

**解决**：
- 检查网络连接
- 如果在国内，可能需要配置代理：

```bash
# .env 文件中添加
HTTP_PROXY=http://127.0.0.1:7890
HTTPS_PROXY=http://127.0.0.1:7890
```

## 📚 更多资源

- [完整文档](./README.md)
- [OpenAI 官方文档](https://platform.openai.com/docs)
- [示例代码](./demos/)

---

**遇到问题？** 查看 [错误处理文档](./docs/09-错误处理与限流.md) 📖
