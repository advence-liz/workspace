# LangChain Agent 示例集合

这个项目包含了多个 LangChain Agent 的典型示例，帮助你快速理解和学习 Agent 的使用。

## 📋 环境要求

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0

检查你的版本：
```bash
node --version  # 应该 >= v18.0.0
npm --version   # 应该 >= 8.0.0
```

## 📦 安装

```bash
npm install
```

## ⚙️ 配置

1. 复制 `.env.example` 为 `.env`
2. 填入你的 API Keys

```bash
cp .env.example .env
```

然后编辑 `.env` 文件：
```bash
OPENAI_API_KEY=your_api_key_here

# 可选：如果使用自定义 API 端点
OPENAI_API_BASE=https://api.openai.com/v1
```

💡 **注意**: 本项目支持自定义 API 端点，详见 [CONFIG_GUIDE.md](CONFIG_GUIDE.md)

## 🚀 运行示例

### 🎯 交互式选择器（推荐）
```bash
npm start
```
运行交互式示例选择器，帮助你快速找到合适的学习示例。

### 1. 基础 ReAct Agent
```bash
npm run demo1
```
展示最基础的 ReAct (Reasoning + Acting) Agent，使用内置工具。

### 2. 搜索 Agent
```bash
npm run demo2
```
集成搜索引擎的 Agent，可以进行实时信息检索。

### 3. 计算器 Agent
```bash
npm run demo3
```
具备数学计算能力的 Agent。

### 4. 对话记忆 Agent
```bash
npm run demo4
```
带有对话历史记忆的 Agent，可以进行多轮对话。

### 5. 自定义工具 Agent
```bash
npm run demo5
```
展示如何创建和使用自定义工具的 Agent。

### 6. 多 Agent 协作
```bash
npm run demo6
```
展示多个专家 Agent 如何协作完成复杂任务。

### 7. 结构化输出 Agent
```bash
npm run demo7
```
展示如何使用结构化工具和 Schema 验证。

### 8. 错误处理 Agent
```bash
npm run demo8
```
展示如何优雅地处理各种错误场景。

## 📚 学习路径

建议按照以下顺序学习：
1. **demo1** - 理解 Agent 基础概念
2. **demo3** - 了解工具的使用
3. **demo5** - 学习自定义工具
4. **demo4** - 掌握记忆管理
5. **demo2** - 集成外部服务

## 🔑 关键概念

- **Agent**: 能够使用工具并进行推理的 AI 系统
- **Tools**: Agent 可以调用的功能模块
- **ReAct**: Reasoning (推理) + Acting (行动) 的模式
- **Memory**: 对话历史记忆管理
- **Chain**: 连接多个步骤的执行链

## 📖 参考资源

- [LangChain 官方文档](https://js.langchain.com/)
- [LangChain Agents 指南](https://js.langchain.com/docs/modules/agents/)
