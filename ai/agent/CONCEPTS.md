# 📚 LangChain Agent 核心概念详解

## 目录
1. [什么是 Agent](#什么是-agent)
2. [ReAct 模式](#react-模式)
3. [Tools（工具）](#tools工具)
4. [Memory（记忆）](#memory记忆)
5. [Chains（链）](#chains链)
6. [Agent 类型](#agent-类型)
7. [最佳实践](#最佳实践)

---

## 什么是 Agent

### 定义
Agent 是一种能够**自主决策**和**使用工具**的 AI 系统。与传统的固定流程不同，Agent 可以根据任务动态选择使用哪些工具以及执行顺序。

### 核心特征
- **自主性**: 自己决定下一步做什么
- **工具使用**: 可以调用外部工具和 API
- **推理能力**: 能够分析问题并制定解决方案
- **迭代执行**: 可以多轮推理和行动直到完成任务

### Agent vs Chain
```
Chain（链）:
输入 → 步骤1 → 步骤2 → 步骤3 → 输出
（固定流程）

Agent（代理）:
输入 → 思考 → 决定使用工具A → 思考 → 决定使用工具B → 输出
（动态决策）
```

---

## ReAct 模式

### 什么是 ReAct？
ReAct = **Re**asoning（推理）+ **Act**ing（行动）

这是一种让 LLM 交替进行推理和行动的模式。

### 工作流程
```
1. Thought（思考）: "我需要计算这个数学问题"
2. Action（行动）: 使用 Calculator 工具
3. Observation（观察）: 得到计算结果
4. Thought（思考）: "现在我有了答案，可以回复用户了"
5. Final Answer（最终答案）: 返回结果
```

### 示例对话
```
用户: 123 + 456 等于多少？

Agent Thought: 我需要使用计算器来计算这个加法
Action: calculator
Action Input: 123 + 456
Observation: 579

Thought: 我现在知道答案了
Final Answer: 123 + 456 等于 579
```

---

## Tools（工具）

### 什么是 Tool？
Tool 是 Agent 可以调用的功能模块，可以是：
- 数学计算
- 搜索引擎
- 数据库查询
- API 调用
- 文件操作
- 任何其他功能

### 工具的组成
```javascript
{
  name: "工具名称",           // 唯一标识
  description: "工具描述",   // 告诉 Agent 何时使用
  func: async (input) => {   // 实际执行的函数
    // 工具逻辑
    return result;
  }
}
```

### 内置工具
LangChain 提供了许多内置工具：
- `Calculator`: 数学计算
- `SerpAPI`: 搜索引擎
- `WikipediaQueryRun`: 维基百科查询
- `RequestsGet`: HTTP 请求
- 等等...

### 自定义工具

#### 简单工具（DynamicTool）
```javascript
import { DynamicTool } from "@langchain/core/tools";

const myTool = new DynamicTool({
  name: "get_current_time",
  description: "获取当前时间",
  func: async () => {
    return new Date().toLocaleString();
  },
});
```

#### 结构化工具（DynamicStructuredTool）
```javascript
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

const myTool = new DynamicStructuredTool({
  name: "get_user_info",
  description: "根据用户ID获取用户信息",
  schema: z.object({
    userId: z.string().describe("用户ID"),
  }),
  func: async ({ userId }) => {
    // 查询逻辑
    return userInfo;
  },
});
```

### 工具设计原则
1. **名称清晰**: 使用描述性的名称
2. **描述详细**: 明确说明工具的用途和使用场景
3. **输入验证**: 验证输入参数的有效性
4. **错误处理**: 优雅地处理错误情况
5. **返回明确**: 返回清晰的结果或错误消息

---

## Memory（记忆）

### 为什么需要 Memory？
默认情况下，每次 Agent 调用都是独立的，无法记住之前的对话。Memory 让 Agent 能够：
- 记住对话历史
- 进行多轮对话
- 保持上下文连贯性

### Memory 类型

#### 1. BufferMemory（缓冲记忆）
保存所有对话历史。

```javascript
import { BufferMemory } from "langchain/memory";

const memory = new BufferMemory({
  memoryKey: "chat_history",
  returnMessages: true,
});
```

**优点**: 保留完整信息
**缺点**: 消耗 token 多

#### 2. ConversationBufferWindowMemory（窗口记忆）
只保留最近 N 轮对话。

```javascript
import { ConversationBufferWindowMemory } from "langchain/memory";

const memory = new ConversationBufferWindowMemory({
  k: 5, // 保留最近5轮对话
});
```

**优点**: 节省 token
**缺点**: 可能丢失重要信息

#### 3. ConversationSummaryMemory（摘要记忆）
使用 LLM 总结对话历史。

```javascript
import { ConversationSummaryMemory } from "langchain/memory";

const memory = new ConversationSummaryMemory({
  llm: model,
});
```

**优点**: 保留关键信息，节省 token
**缺点**: 需要额外的 LLM 调用

### Memory 使用示例
```javascript
const agentExecutor = new AgentExecutor({
  agent,
  tools,
  memory, // 添加 memory
});

// 第一轮对话
await agentExecutor.invoke({ input: "我叫小明" });

// 第二轮对话（Agent 会记得名字）
await agentExecutor.invoke({ input: "你记得我的名字吗？" });
```

---

## Chains（链）

### 什么是 Chain？
Chain 是将多个组件按顺序连接起来的方式。

### Chain vs Agent
- **Chain**: 固定的执行流程，适合确定的任务
- **Agent**: 动态的决策过程，适合复杂的任务

### 常见 Chain 类型

#### 1. LLMChain
最基础的链，将 Prompt + LLM 组合。

```javascript
import { LLMChain } from "langchain/chains";

const chain = new LLMChain({
  llm: model,
  prompt: promptTemplate,
});
```

#### 2. SequentialChain
按顺序执行多个链。

```javascript
import { SequentialChain } from "langchain/chains";

const chain = new SequentialChain({
  chains: [chain1, chain2, chain3],
});
```

---

## Agent 类型

### 1. Zero-shot ReAct Agent
- 最常用的 Agent 类型
- 根据工具描述决定使用哪个工具
- 适合大多数场景

```javascript
import { createReactAgent } from "langchain/agents";

const agent = await createReactAgent({
  llm: model,
  tools,
  prompt,
});
```

### 2. Conversational Agent
- 专为对话场景设计
- 内置对话记忆
- 更自然的对话体验

### 3. Structured Chat Agent
- 支持多输入工具
- 适合复杂的工具调用

### 4. OpenAI Functions Agent
- 使用 OpenAI 的 Function Calling
- 更可靠的工具调用
- 仅支持 OpenAI 模型

---

## 最佳实践

### 1. 工具设计
✅ **好的工具描述**
```javascript
{
  name: "search_products",
  description: "在数据库中搜索产品。当用户想要查找、搜索或浏览产品时使用此工具。输入应该是产品名称或关键词。",
}
```

❌ **不好的工具描述**
```javascript
{
  name: "search",
  description: "搜索",
}
```

### 2. 错误处理
```javascript
const tool = new DynamicTool({
  name: "my_tool",
  description: "...",
  func: async (input) => {
    try {
      // 工具逻辑
      return result;
    } catch (error) {
      // 返回清晰的错误消息，而不是抛出异常
      return `错误: ${error.message}`;
    }
  },
});
```

### 3. 限制迭代次数
```javascript
const agentExecutor = new AgentExecutor({
  agent,
  tools,
  maxIterations: 10, // 防止无限循环
});
```

### 4. 使用 verbose 模式调试
```javascript
const agentExecutor = new AgentExecutor({
  agent,
  tools,
  verbose: true, // 开发时启用，生产环境关闭
});
```

### 5. 选择合适的模型
- **GPT-4**: 复杂推理、高准确度要求
- **GPT-3.5**: 简单任务、成本敏感
- **Temperature**:
  - 0: 确定性任务（推荐）
  - 0.7-1.0: 创意性任务

### 6. 工具数量控制
- 建议不超过 10 个工具
- 工具太多会影响 Agent 的决策能力
- 考虑使用工具分组或多 Agent 架构

### 7. Prompt 优化
```javascript
// 自定义 prompt 来改善 Agent 行为
const customPrompt = `你是一个专业的助手...
在回答问题时，请遵循以下步骤：
1. 分析问题
2. 确定需要使用的工具
3. 执行工具
4. 总结结果

可用工具：
{tools}

...
`;
```

---

## 调试技巧

### 1. 启用 verbose 模式
```javascript
verbose: true
```

### 2. 查看中间步骤
```javascript
const result = await agentExecutor.invoke({ input });
console.log("中间步骤:", result.intermediateSteps);
```

### 3. 测试单个工具
```javascript
// 单独测试工具
const result = await myTool.call("test input");
console.log(result);
```

### 4. 使用更小的测试用例
从简单的问题开始，逐步增加复杂度。

---

## 性能优化

### 1. 缓存 LLM 响应
```javascript
import { InMemoryCache } from "langchain/cache";

const cache = new InMemoryCache();
const model = new ChatOpenAI({
  cache,
});
```

### 2. 并行工具调用
如果工具支持，可以并行执行多个工具。

### 3. 流式输出
```javascript
const stream = await agentExecutor.stream({ input });
for await (const chunk of stream) {
  console.log(chunk);
}
```

---

## 常见问题

### Q: Agent 陷入循环怎么办？
A: 设置 `maxIterations` 限制最大迭代次数。

### Q: Agent 选错工具怎么办？
A: 优化工具的 `description`，使其更清晰。

### Q: 如何让 Agent 更可靠？
A:
1. 使用更好的模型（如 GPT-4）
2. 优化 Prompt
3. 减少工具数量
4. 使用结构化工具

### Q: 如何降低成本？
A:
1. 使用 GPT-3.5
2. 使用 ConversationBufferWindowMemory
3. 减少 verbose 输出
4. 启用缓存

---

## 总结

### 核心要点
1. **Agent = 推理 + 工具使用**
2. **ReAct 模式是最常用的 Agent 模式**
3. **工具设计的好坏直接影响 Agent 性能**
4. **Memory 让 Agent 能够进行多轮对话**
5. **合理设置限制和错误处理很重要**

### 学习路径
1. 理解 ReAct 模式
2. 学习使用内置工具
3. 创建自定义工具
4. 掌握 Memory 管理
5. 优化 Agent 性能
6. 构建复杂的多 Agent 系统

### 下一步
- 运行示例代码
- 修改工具行为
- 创建自己的 Agent
- 集成到实际项目
