# 🚀 快速入门指南

## 环境要求

在开始之前，请确保你的环境满足以下要求：

### Node.js 版本
- **要求**: Node.js >= 18.0.0
- **推荐**: Node.js 18.x 或 20.x LTS 版本

### npm 版本
- **要求**: npm >= 8.0.0

### 检查版本
```bash
node --version  # 应该显示 v18.0.0 或更高
npm --version   # 应该显示 8.0.0 或更高
```

### 如果版本不符合要求
访问 [Node.js 官网](https://nodejs.org/) 下载并安装最新的 LTS 版本。

---

## 第一步：安装依赖

```bash
npm install
```

## 第二步：配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，添加你的配置：

```env
OPENAI_API_KEY=your_api_key_here

# 可选：如果使用自定义 API 端点（兼容 OpenAI 格式）
OPENAI_API_BASE=https://api.openai.com/v1
```

💡 **注意**: 本项目支持自定义 OpenAI 兼容的 API 端点
📖 详细配置说明请查看 [CONFIG_GUIDE.md](CONFIG_GUIDE.md)

## 第三步：运行第一个示例

```bash
npm run demo1
```

## 🎯 示例说明

### 基础示例（推荐从这里开始）

#### Demo 1: 基础 ReAct Agent
```bash
npm run demo1
```
- **学习目标**: 理解 Agent 的基本工作原理
- **核心概念**: ReAct (推理 + 行动)
- **使用工具**: Calculator（计算器）
- **难度**: ⭐

#### Demo 3: 计算器 Agent
```bash
npm run demo3
```
- **学习目标**: 掌握工具的使用方式
- **核心概念**: Tool 调用、迭代次数控制
- **使用工具**: Calculator
- **难度**: ⭐

### 进阶示例

#### Demo 5: 自定义工具 Agent
```bash
npm run demo5
```
- **学习目标**: 学习创建自定义工具
- **核心概念**: DynamicTool、工具定义
- **使用工具**: 自定义工具（字符串处理、时间查询等）
- **难度**: ⭐⭐

#### Demo 4: 带记忆的 Agent
```bash
npm run demo4
```
- **学习目标**: 实现多轮对话记忆
- **核心概念**: BufferMemory、对话历史
- **使用工具**: Calculator + Memory
- **难度**: ⭐⭐

#### Demo 7: 结构化输出 Agent
```bash
npm run demo7
```
- **学习目标**: 使用结构化工具和 Zod 验证
- **核心概念**: DynamicStructuredTool、Schema 定义
- **使用工具**: 自定义结构化工具
- **难度**: ⭐⭐⭐

### 高级示例

#### Demo 6: 多 Agent 协作
```bash
npm run demo6
```
- **学习目标**: 实现多个 Agent 的协作
- **核心概念**: Agent 组合、任务分发
- **使用工具**: 多个专家 Agent
- **难度**: ⭐⭐⭐

#### Demo 8: 错误处理 Agent
```bash
npm run demo8
```
- **学习目标**: 优雅处理各种错误场景
- **核心概念**: 错误处理、重试机制、超时控制
- **使用工具**: 各种可能失败的工具
- **难度**: ⭐⭐⭐

#### Demo 2: 搜索 Agent
```bash
npm run demo2
```
- **学习目标**: 集成外部搜索服务
- **核心概念**: 外部 API 集成
- **使用工具**: SerpAPI（需要额外配置）
- **难度**: ⭐⭐⭐
- **注意**: 需要配置 `SERPAPI_API_KEY`

## 📖 学习路线建议

### 初学者路线
1. Demo 1 → Demo 3 → Demo 5 → Demo 4

### 进阶路线
1. Demo 7 → Demo 8 → Demo 6

### 完整路线
1. Demo 1（基础概念）
2. Demo 3（工具使用）
3. Demo 5（自定义工具）
4. Demo 4（记忆管理）
5. Demo 7（结构化输出）
6. Demo 8（错误处理）
7. Demo 6（多 Agent 协作）
8. Demo 2（外部集成）

## 💡 核心概念速查

### Agent（代理）
- 能够使用工具并进行推理的 AI 系统
- 根据任务自主决定使用哪些工具
- 可以进行多轮推理和行动

### Tool（工具）
- Agent 可以调用的功能模块
- 可以是内置工具（如 Calculator）
- 也可以是自定义工具（DynamicTool）

### ReAct 模式
- **Re**asoning（推理）: Agent 思考如何解决问题
- **Act**ing（行动）: Agent 调用工具执行操作
- 循环进行直到完成任务

### Memory（记忆）
- 保存对话历史
- 支持多轮对话
- 常用类型: BufferMemory, ConversationBufferMemory

### Prompt
- 指导 Agent 行为的提示词模板
- 可以从 LangChain Hub 获取
- 也可以自定义

## 🔧 常见问题

### Q: 如何更换模型？
A: 修改代码中的 `modelName` 参数：
```javascript
const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo", // 或 "gpt-4"
  temperature: 0,
});
```

### Q: 如何控制 Agent 的详细输出？
A: 设置 `verbose` 参数：
```javascript
const agentExecutor = new AgentExecutor({
  agent,
  tools,
  verbose: true, // true=显示详细过程，false=只显示结果
});
```

### Q: 如何限制 Agent 的执行步骤？
A: 设置 `maxIterations` 参数：
```javascript
const agentExecutor = new AgentExecutor({
  agent,
  tools,
  maxIterations: 5, // 最多执行5轮
});
```

### Q: 为什么 Demo 2 运行失败？
A: Demo 2 需要 SerpAPI Key，请：
1. 访问 https://serpapi.com/ 注册账号
2. 获取 API Key
3. 在 `.env` 文件中添加 `SERPAPI_API_KEY`

## 🎓 下一步学习

1. **修改示例代码**: 尝试修改工具的行为
2. **创建新工具**: 根据需求创建自己的工具
3. **组合多个工具**: 让 Agent 使用多种工具协作
4. **优化 Prompt**: 自定义 Agent 的行为模式
5. **集成到项目**: 将 Agent 集成到实际应用中

## 📚 推荐资源

- [LangChain JS 官方文档](https://js.langchain.com/)
- [LangChain Hub](https://smith.langchain.com/hub)
- [OpenAI API 文档](https://platform.openai.com/docs)
