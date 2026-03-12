# 📚 Memory（记忆）使用指南

## 核心问题：chat_history 与 Prompt 模板的配合

你提出了一个非常重要的问题：**chat_history 确实需要与合适的 Prompt 模板配合使用！**

## 🔍 问题分析

### ❌ 错误的做法

```javascript
// 使用标准的 react prompt（不包含 chat_history）
const prompt = await pull("hwchase17/react");

// 创建 Memory
const memory = new BufferMemory({
  memoryKey: "chat_history",  // ⚠️ 但 prompt 中没有这个变量！
  returnMessages: true,
});
```

**问题**：
- `hwchase17/react` prompt **不包含** `{chat_history}` 变量
- Memory 会收集对话历史，但无法注入到 Prompt 中
- Agent 看不到历史对话，记忆功能失效

### ✅ 正确的做法

```javascript
// 创建包含 chat_history 的自定义 Prompt
const customPrompt = PromptTemplate.fromTemplate(`
Answer the following questions as best you can. You have access to the following tools:

{tools}

Use the following format:
...

Previous conversation history:
{chat_history}

Begin!

Question: {input}
Thought:{agent_scratchpad}
`);

// 创建 Memory（memoryKey 与 Prompt 中的变量名一致）
const memory = new BufferMemory({
  memoryKey: "chat_history",  // ✅ 与 Prompt 中的 {chat_history} 对应
  returnMessages: true,
});

// 创建 Agent
const agent = await createReactAgent({
  llm: model,
  tools,
  prompt: customPrompt,  // ✅ 使用自定义 prompt
});
```

## 📋 Prompt 模板与 Memory 的关系

### 1. Prompt 变量

Prompt 模板中可以包含以下变量：

```
{input}              - 用户当前输入（必需）
{tools}              - 工具列表（必需）
{tool_names}         - 工具名称列表（必需）
{agent_scratchpad}   - Agent 的思考过程（必需）
{chat_history}       - 对话历史（可选，需要 Memory）
```

### 2. Memory 的 memoryKey

`memoryKey` 必须与 Prompt 中的变量名**完全一致**：

```javascript
// Prompt 中使用 {chat_history}
const prompt = PromptTemplate.fromTemplate(`
  ...
  {chat_history}
  ...
`);

// Memory 的 memoryKey 必须是 "chat_history"
const memory = new BufferMemory({
  memoryKey: "chat_history",  // 必须匹配
});
```

### 3. 工作流程

```
用户输入 → Memory 加载历史 → 注入到 Prompt → LLM 生成回复 → 保存到 Memory
```

详细过程：

1. **用户输入**: "把刚才的结果乘以 3"
2. **Memory 加载**: 从 BufferMemory 中获取之前的对话
3. **注入 Prompt**:
   ```
   Previous conversation history:
   Human: 请帮我计算 100 + 200
   AI: 100 + 200 等于 300

   Question: 把刚才的结果乘以 3
   ```
4. **LLM 理解**: 看到历史，知道"刚才的结果"是 300
5. **生成回复**: "300 × 3 = 900"
6. **保存记忆**: 将本轮对话也保存到 Memory

## 🎯 三种 Prompt 方案对比

### 方案 1: hwchase17/react（标准，不支持记忆）

```python
# ❌ 不包含 chat_history
Answer the following questions as best you can. You have access to the following tools:

{tools}

Use the following format:

Question: {input}
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
...
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
Thought:{agent_scratchpad}
```

**特点**：
- ✅ 简单直接
- ❌ 不支持 chat_history
- ❌ 无法使用 Memory

### 方案 2: hwchase17/react-chat（推荐，支持记忆）

```python
# ✅ 包含 chat_history
Assistant is a large language model...

TOOLS:
------
Assistant has access to the following tools:

{tools}

To use a tool, please use the following format:
...

Previous conversation history:
{chat_history}

New input: {input}
{agent_scratchpad}
```

**特点**：
- ✅ **官方提供，直接可用**
- ✅ 包含 chat_history
- ✅ 支持 Memory
- ✅ 专为对话设计
- ✅ **最简单的方案**

**使用方法**：
```javascript
const prompt = await pull("hwchase17/react-chat");
const memory = new BufferMemory({
  memoryKey: "chat_history",
  returnMessages: true,
});
```

### 方案 3: 自定义 Prompt（灵活但复杂）

```javascript
const customPrompt = PromptTemplate.fromTemplate(`
Answer the following questions as best you can. You have access to the following tools:

{tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Previous conversation history:
{chat_history}

Begin!

Question: {input}
Thought:{agent_scratchpad}
`);
```

**特点**：
- ✅ 支持 chat_history
- ✅ 可以使用 Memory
- ✅ 完全自定义格式
- ⚠️ 需要手动编写和维护

## 📊 三种方案总结

| 特性 | react | react-chat | 自定义 |
|------|-------|-----------|--------|
| 支持 Memory | ❌ | ✅ | ✅ |
| 官方维护 | ✅ | ✅ | ❌ |
| 简单易用 | ✅ | ✅ | ❌ |
| 灵活性 | ❌ | ❌ | ✅ |
| **推荐度** | 单次查询 | **多轮对话** ⭐ | 特殊需求 |

**结论**: 对于带记忆的 Agent，**直接使用 `hwchase17/react-chat` 是最佳选择**！

## 💡 Memory 类型

### 1. BufferMemory（缓冲记忆）

保存所有对话历史。

```javascript
const memory = new BufferMemory({
  memoryKey: "chat_history",
  returnMessages: true,
});
```

**优点**：保留完整信息
**缺点**：消耗 token 多

### 2. ConversationBufferWindowMemory（窗口记忆）

只保留最近 N 轮对话。

```javascript
import { ConversationBufferWindowMemory } from "langchain/memory";

const memory = new ConversationBufferWindowMemory({
  k: 5,  // 只保留最近 5 轮
  memoryKey: "chat_history",
  returnMessages: true,
});
```

**优点**：节省 token
**缺点**：可能丢失重要信息

### 3. ConversationSummaryMemory（摘要记忆）

使用 LLM 总结对话历史。

```javascript
import { ConversationSummaryMemory } from "langchain/memory";

const memory = new ConversationSummaryMemory({
  llm: model,
  memoryKey: "chat_history",
  returnMessages: true,
});
```

**优点**：保留关键信息，节省 token
**缺点**：需要额外的 LLM 调用

## 🔧 完整示例

### 基础示例（无记忆）

```javascript
import { ChatOpenAI } from "@langchain/openai";
import { Calculator } from "@langchain/community/tools/calculator";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { pull } from "langchain/hub";

const model = new ChatOpenAI({ modelName: "gpt-4" });
const tools = [new Calculator()];
const prompt = await pull("hwchase17/react");

const agent = await createReactAgent({ llm: model, tools, prompt });
const agentExecutor = new AgentExecutor({ agent, tools });

// ❌ 无法理解"刚才的结果"
await agentExecutor.invoke({ input: "计算 100 + 200" });
await agentExecutor.invoke({ input: "把刚才的结果乘以 3" });  // 不知道"刚才的结果"是什么
```

### 完整示例（带记忆 - 推荐方法）

```javascript
import { ChatOpenAI } from "@langchain/openai";
import { Calculator } from "@langchain/community/tools/calculator";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { BufferMemory } from "langchain/memory";
import { pull } from "langchain/hub";

// 1. 使用 react-chat prompt（已包含 chat_history）
const prompt = await pull("hwchase17/react-chat");

// 2. 创建 Memory
const memory = new BufferMemory({
  memoryKey: "chat_history",  // 与 Prompt 中的变量名一致
  returnMessages: true,
});

// 3. 创建 Agent
const model = new ChatOpenAI({ modelName: "gpt-4" });
const tools = [new Calculator()];
const agent = await createReactAgent({
  llm: model,
  tools,
  prompt,  // 使用 react-chat prompt
});

// 4. 创建执行器（带 Memory）
const agentExecutor = new AgentExecutor({
  agent,
  tools,
  memory,  // 添加 memory
  handleParsingErrors: true,
});

// 5. 多轮对话
await agentExecutor.invoke({ input: "计算 100 + 200" });
// Agent 回复: 300

await agentExecutor.invoke({ input: "把刚才的结果乘以 3" });
// ✅ Agent 能看到历史，知道"刚才的结果"是 300
// Agent 回复: 900
```

## 🎓 关键知识点

### 1. Prompt 必须包含 chat_history

```javascript
// ❌ 错误：Prompt 中没有 {chat_history}
const prompt = await pull("hwchase17/react");

// ✅ 正确：Prompt 中包含 {chat_history}
const prompt = PromptTemplate.fromTemplate(`
  ...
  Previous conversation history:
  {chat_history}
  ...
`);
```

### 2. memoryKey 必须匹配

```javascript
// Prompt 中的变量名
{chat_history}

// Memory 的 memoryKey 必须一致
const memory = new BufferMemory({
  memoryKey: "chat_history",  // 必须匹配
});
```

### 3. returnMessages 的作用

```javascript
const memory = new BufferMemory({
  memoryKey: "chat_history",
  returnMessages: true,  // 返回 Message 对象而不是字符串
});
```

- `true`: 返回 `HumanMessage` 和 `AIMessage` 对象
- `false`: 返回格式化的字符串

通常使用 `true` 以保留更多信息。

## 🔍 调试 Memory

### 查看 Memory 内容

```javascript
// 查看当前记忆
const memoryVariables = await memory.loadMemoryVariables({});
console.log(memoryVariables.chat_history);
```

### 清空 Memory

```javascript
await memory.clear();
```

### 手动添加到 Memory

```javascript
await memory.saveContext(
  { input: "用户说的话" },
  { output: "Agent 的回复" }
);
```

## ⚠️ 常见错误

### 错误 1：Prompt 中没有 chat_history

```javascript
// ❌ 使用标准 prompt，但配置了 Memory
const prompt = await pull("hwchase17/react");  // 没有 chat_history
const memory = new BufferMemory({ memoryKey: "chat_history" });

// 结果：Memory 收集了历史，但 Agent 看不到
```

### 错误 2：memoryKey 不匹配

```javascript
// ❌ Prompt 中是 {chat_history}，但 memoryKey 是 "history"
const prompt = PromptTemplate.fromTemplate(`...{chat_history}...`);
const memory = new BufferMemory({ memoryKey: "history" });  // 不匹配

// 结果：Memory 无法注入到正确的位置
```

### 错误 3：忘记传入 memory

```javascript
// ❌ 配置了 Memory，但没有传给 AgentExecutor
const memory = new BufferMemory({ memoryKey: "chat_history" });
const agentExecutor = new AgentExecutor({
  agent,
  tools,
  // memory,  // 忘记传入
});

// 结果：Memory 不会被使用
```

## 📊 对比总结

| 特性 | 无 Memory | 有 Memory（正确配置） |
|------|-----------|---------------------|
| Prompt 模板 | 标准 react | 自定义（含 chat_history） |
| 上下文理解 | ❌ 无法理解"刚才" | ✅ 能理解上下文 |
| 多轮对话 | ❌ 每轮独立 | ✅ 连贯对话 |
| Token 消耗 | 低 | 高（包含历史） |
| 适用场景 | 单次查询 | 对话式交互 |

## 🎯 最佳实践

1. **明确是否需要 Memory**
   - 单次查询 → 不需要
   - 多轮对话 → 需要

2. **使用自定义 Prompt**
   - 包含 `{chat_history}` 变量
   - 放在合适的位置（通常在 Question 之前）

3. **选择合适的 Memory 类型**
   - 对话轮数少 → BufferMemory
   - 对话轮数多 → ConversationBufferWindowMemory
   - 需要长期记忆 → ConversationSummaryMemory

4. **注意 Token 消耗**
   - Memory 会增加 Prompt 长度
   - 考虑使用窗口记忆或摘要记忆

5. **测试 Memory 是否生效**
   - 使用"刚才的结果"等引用
   - 查看 verbose 日志中的 chat_history

## 总结

**你的问题非常关键**：`chat_history` 确实需要与 Prompt 模板配合！

核心要点：
1. ✅ Prompt 必须包含 `{chat_history}` 变量
2. ✅ Memory 的 `memoryKey` 必须与变量名一致
3. ✅ 将 Memory 传入 AgentExecutor
4. ✅ 使用需要上下文的问题来测试

这样才能真正实现带记忆的 Agent！🎉
