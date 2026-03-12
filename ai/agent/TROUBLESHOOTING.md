# 🔧 故障排除指南

## Demo 4 错误：OUTPUT_PARSING_FAILURE

### 问题描述

运行 `npm run demo4` 时出现错误：
```
OutputParserException: Could not parse LLM output
```

### 错误原因

**根本原因**: ReAct Agent 要求 LLM 输出必须遵循特定格式：

```
Thought: [思考过程]
Action: [工具名称]
Action Input: [工具输入]
```

或者：

```
Thought: I now know the final answer
Final Answer: [最终答案]
```

当 LLM 的输出不符合这个格式时，解析器会报错。

### 为什么会发生？

1. **输入不适合工具使用**
   - 原示例：`"我的名字是小明"` - 这是陈述，不需要使用工具
   - LLM 认为不需要调用 calculator，直接回复了
   - 但回复没有遵循 ReAct 格式，导致解析失败

2. **LLM 输出格式不正确**
   - LLM 可能用自然语言回复
   - 或者输出格式有细微差异

### 解决方案

#### 方案 1：启用错误处理（推荐）

在 `AgentExecutor` 中启用 `handleParsingErrors`：

```javascript
const agentExecutor = new AgentExecutor({
  agent,
  tools,
  memory,
  verbose: true,
  handleParsingErrors: true, // ✅ 启用错误处理
});
```

**效果**: 当解析失败时，Agent 会将错误信息反馈给 LLM，让它重新生成正确格式的输出。

#### 方案 2：使用适合的问题

确保问题需要使用工具：

```javascript
// ❌ 不好：不需要工具
"我的名字是小明"
"你好"

// ✅ 好：需要使用 calculator 工具
"请帮我计算 100 + 200"
"把刚才的结果乘以 3"
```

#### 方案 3：使用不同的 Agent 类型

如果主要用于对话而非工具调用，考虑使用：
- `ConversationalAgent` - 专为对话设计
- `ChatAgent` - 更灵活的对话 Agent

### 修复后的代码

```javascript
// 修复要点：
// 1. 启用 handleParsingErrors
// 2. 使用需要工具的问题
// 3. 添加 try-catch 错误处理

const agentExecutor = new AgentExecutor({
  agent,
  tools,
  memory,
  verbose: true,
  handleParsingErrors: true, // 关键修复
});

// 使用适合的对话内容
const conversation = [
  "请帮我计算 100 + 200",      // ✅ 需要工具
  "把刚才的结果乘以 3",         // ✅ 需要工具
  "再把结果除以 2",             // ✅ 需要工具
  "最终的结果是多少？",         // ✅ 需要工具
];

// 添加错误处理
try {
  const result = await agentExecutor.invoke({ input });
  console.log(result.output);
} catch (error) {
  console.log(`错误: ${error.message}`);
}
```

## 常见错误及解决方案

### 1. 环境变量未配置

**错误**:
```
❌ 错误: 未配置 OPENAI_API_KEY
```

**解决**:
```bash
cp .env.example .env
# 编辑 .env 文件，添加 API Key
```

### 2. Node.js 版本过低

**错误**:
```
SyntaxError: Cannot use import statement outside a module
```

**解决**:
```bash
node --version  # 检查版本
# 如果 < 18.0.0，升级 Node.js
```

### 3. 依赖未安装

**错误**:
```
Error: Cannot find module '@langchain/openai'
```

**解决**:
```bash
npm install
```

### 4. API 端点无法访问

**错误**:
```
Error: connect ETIMEDOUT
```

**解决**:
1. 检查网络连接
2. 验证 `OPENAI_API_BASE` 是否正确
3. 确认有权限访问该端点

### 5. Token 超限

**错误**:
```
Error: This model's maximum context length is 4096 tokens
```

**解决**:
1. 减少输入长度
2. 使用更大上下文的模型
3. 清理对话历史

### 6. 解析错误（ReAct Agent）

**错误**:
```
OutputParserException: Could not parse LLM output
```

**解决**:
1. 启用 `handleParsingErrors: true`
2. 使用需要工具的问题
3. 检查 Prompt 是否正确

### 7. 工具调用失败

**错误**:
```
Error: Calculator tool failed
```

**解决**:
1. 检查工具输入格式
2. 验证工具是否正确初始化
3. 查看工具的具体错误信息

### 8. 内存问题

**错误**:
```
JavaScript heap out of memory
```

**解决**:
```bash
# 增加 Node.js 内存限制
node --max-old-space-size=4096 demos/04-memory-agent.js
```

### 9. 超时错误

**错误**:
```
Error: Timeout waiting for response
```

**解决**:
1. 检查网络连接
2. 增加超时时间
3. 使用更快的模型（如 gpt-3.5-turbo）

### 10. Rate Limit 错误

**错误**:
```
Error: Rate limit exceeded
```

**解决**:
1. 等待一段时间后重试
2. 检查 API 配额
3. 使用重试机制

## 调试技巧

### 1. 启用详细日志

```javascript
const agentExecutor = new AgentExecutor({
  agent,
  tools,
  verbose: true, // 显示详细执行过程
});
```

### 2. 捕获错误详情

```javascript
try {
  const result = await agentExecutor.invoke({ input });
} catch (error) {
  console.error("错误类型:", error.constructor.name);
  console.error("错误消息:", error.message);
  console.error("错误堆栈:", error.stack);

  // 如果是 OutputParserException
  if (error.lc_error_code === 'OUTPUT_PARSING_FAILURE') {
    console.error("LLM 输出:", error.llmOutput);
  }
}
```

### 3. 测试单个工具

```javascript
// 单独测试工具是否正常
const calculator = new Calculator();
const result = await calculator.call("100 + 200");
console.log("工具结果:", result);
```

### 4. 验证 LLM 连接

```javascript
// 测试 LLM 是否正常
const model = new ChatOpenAI(getLLMConfig());
const result = await model.invoke("Hello");
console.log("LLM 响应:", result.content);
```

### 5. 检查内存状态

```javascript
// 查看记忆内容
const memoryVariables = await memory.loadMemoryVariables({});
console.log("记忆内容:", memoryVariables);
```

## 性能优化

### 1. 关闭 verbose 模式

```javascript
// 生产环境关闭详细日志
const agentExecutor = new AgentExecutor({
  agent,
  tools,
  verbose: false,
});
```

### 2. 使用更快的模型

```javascript
// 使用 GPT-3.5 替代 GPT-4
const model = new ChatOpenAI(getLLMConfig({
  modelName: "gpt-3.5-turbo"
}));
```

### 3. 限制迭代次数

```javascript
const agentExecutor = new AgentExecutor({
  agent,
  tools,
  maxIterations: 5, // 限制最大迭代次数
});
```

### 4. 使用窗口记忆

```javascript
import { ConversationBufferWindowMemory } from "langchain/memory";

// 只保留最近 5 轮对话
const memory = new ConversationBufferWindowMemory({
  k: 5,
  memoryKey: "chat_history",
  returnMessages: true,
});
```

## 获取帮助

### 1. 查看文档
- `README.md` - 项目介绍
- `QUICKSTART.md` - 快速入门
- `CONCEPTS.md` - 核心概念
- `CONFIG_GUIDE.md` - 配置指南

### 2. 查看示例代码
每个示例都包含详细的注释，可以参考学习。

### 3. 启用 verbose 模式
开启详细日志可以帮助理解执行过程和定位问题。

### 4. 查看 LangChain 文档
- [LangChain JS 官方文档](https://js.langchain.com/)
- [Troubleshooting 页面](https://js.langchain.com/docs/troubleshooting/)

### 5. 检查 GitHub Issues
- [LangChain JS Issues](https://github.com/langchain-ai/langchainjs/issues)

## 总结

### 快速检查清单

- [ ] Node.js >= 18.0.0
- [ ] 已运行 `npm install`
- [ ] 已配置 `.env` 文件
- [ ] `OPENAI_API_KEY` 已设置
- [ ] 网络连接正常
- [ ] API 端点可访问

### 最常见的问题

1. **环境变量未配置** → 配置 `.env`
2. **Node.js 版本过低** → 升级到 18+
3. **解析错误** → 启用 `handleParsingErrors: true`
4. **网络问题** → 检查连接和端点

### 调试步骤

1. 检查环境要求
2. 启用 verbose 模式
3. 查看详细错误信息
4. 参考本文档找到对应解决方案
5. 如果仍有问题，查看官方文档

---

**记住**: 大多数问题都可以通过启用 `verbose: true` 和 `handleParsingErrors: true` 来解决！
