# 02 - Chat Completions API

> 核心对话 API，是 OpenAI 最常用的功能

## 📝 概述

Chat Completions API 用于生成对话式响应，支持：
- 单轮对话
- 多轮对话（带历史上下文）
- 流式响应
- 函数调用
- JSON 模式输出

## 🎯 基础用法

### 单轮对话

```typescript
import OpenAI from 'openai';

const openai = new OpenAI();

const completion = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [
    { role: 'user', content: '什么是递归？' }
  ],
});

console.log(completion.choices[0].message.content);
```

### 带系统提示的对话

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [
    {
      role: 'system',
      content: '你是一个专业的 Python 编程导师，擅长用简单的例子解释复杂概念。'
    },
    {
      role: 'user',
      content: '什么是装饰器？'
    }
  ],
});
```

**System Prompt 最佳实践**：
- 明确角色定位
- 指定回复风格（正式/轻松/专业）
- 设定输出格式要求
- 定义限制条件

### 多轮对话

```typescript
const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
  { role: 'system', content: '你是一个有帮助的助手。' },
  { role: 'user', content: '什么是 TypeScript？' },
  { role: 'assistant', content: 'TypeScript 是 JavaScript 的超集...' },
  { role: 'user', content: '它和 JavaScript 的主要区别是什么？' },
];

const completion = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages,
});
```

## 🌊 流式响应

流式响应可以逐步返回结果，提升用户体验：

```typescript
const stream = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: '写一首关于春天的诗' }],
  stream: true,
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || '';
  process.stdout.write(content);
}
```

### 完整流式示例（带错误处理）

```typescript
async function streamChat(prompt: string) {
  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    let fullResponse = '';

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;

      if (delta?.content) {
        fullResponse += delta.content;
        process.stdout.write(delta.content);
      }

      // 检查是否结束
      if (chunk.choices[0]?.finish_reason === 'stop') {
        console.log('\n\n✅ 完成');
      }
    }

    return fullResponse;
  } catch (error) {
    console.error('流式响应错误:', error);
    throw error;
  }
}
```

## 🛠 函数调用 (Function Calling)

让 AI 调用你定义的函数，实现工具使用能力。

### 定义函数

```typescript
const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: '获取指定城市的天气信息',
      parameters: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
            description: '城市名称，如：北京、上海',
          },
          unit: {
            type: 'string',
            enum: ['celsius', 'fahrenheit'],
            description: '温度单位',
          },
        },
        required: ['city'],
      },
    },
  },
];
```

### 完整函数调用流程

```typescript
async function chatWithFunctions(userMessage: string) {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'user', content: userMessage }
  ];

  // 第一次调用：让 AI 决定是否需要调用函数
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
    tools,
    tool_choice: 'auto', // 自动决定是否调用函数
  });

  const responseMessage = response.choices[0].message;
  messages.push(responseMessage);

  // 检查是否需要调用函数
  if (responseMessage.tool_calls) {
    for (const toolCall of responseMessage.tool_calls) {
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      console.log(`🔧 调用函数: ${functionName}`);
      console.log(`📝 参数:`, functionArgs);

      // 执行实际函数
      let functionResponse;
      if (functionName === 'get_weather') {
        functionResponse = await getWeather(functionArgs.city, functionArgs.unit);
      }

      // 将函数结果添加到消息历史
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(functionResponse),
      });
    }

    // 第二次调用：让 AI 基于函数结果生成最终回复
    const finalResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
    });

    return finalResponse.choices[0].message.content;
  }

  return responseMessage.content;
}

// 模拟天气 API
async function getWeather(city: string, unit: string = 'celsius') {
  // 实际应用中这里应该调用真实的天气 API
  return {
    city,
    temperature: 22,
    unit,
    condition: '晴朗',
  };
}

// 使用
const result = await chatWithFunctions('北京今天天气怎么样？');
console.log(result);
```

### Function Calling 最佳实践

1. **清晰的函数描述**：让 AI 理解何时调用
2. **严格的参数定义**：使用 JSON Schema 定义类型
3. **错误处理**：函数执行失败时返回错误信息
4. **安全验证**：验证 AI 生成的参数是否合法

## 📄 JSON 模式

强制 AI 输出有效的 JSON：

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo-1106', // 需要支持 JSON 模式的模型
  messages: [
    {
      role: 'system',
      content: '你是一个数据提取助手，输出 JSON 格式。'
    },
    {
      role: 'user',
      content: '从这段文本提取人名、地点和日期：张三在2024年3月12日去了北京。'
    }
  ],
  response_format: { type: 'json_object' },
});

const data = JSON.parse(completion.choices[0].message.content);
console.log(data);
// { "name": "张三", "location": "北京", "date": "2024-03-12" }
```

**注意事项**：
- 必须在 system 或 user 消息中提到 "JSON"
- 输出保证是有效的 JSON，但结构需要在提示中指定
- 使用 Zod 等库验证输出结构

### 结合 Zod 验证

```typescript
import { z } from 'zod';

const PersonSchema = z.object({
  name: z.string(),
  location: z.string(),
  date: z.string(),
});

const completion = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo-1106',
  messages: [
    {
      role: 'system',
      content: `提取信息并输出 JSON，格式：${JSON.stringify(PersonSchema.shape)}`
    },
    {
      role: 'user',
      content: '张三在2024年3月12日去了北京。'
    }
  ],
  response_format: { type: 'json_object' },
});

const data = PersonSchema.parse(
  JSON.parse(completion.choices[0].message.content)
);
```

## ⚙️ 高级参数

### Temperature vs Top P

```typescript
// Temperature: 控制随机性
{
  temperature: 0,    // 确定性（适合事实问答）
  temperature: 0.7,  // 平衡（默认）
  temperature: 1.5,  // 创造性（适合创意写作）
}

// Top P: 核采样
{
  top_p: 0.1,  // 只考虑概率最高的 10% token
  top_p: 1,    // 考虑所有可能的 token（默认）
}
```

**建议**：只调整 temperature 或 top_p 之一，不要同时调整。

### Frequency & Presence Penalty

```typescript
{
  frequency_penalty: 0.5,  // 降低重复词频率（-2 到 2）
  presence_penalty: 0.5,   // 鼓励讨论新话题（-2 到 2）
}
```

- **Frequency Penalty**：惩罚已出现的词（值越大，重复越少）
- **Presence Penalty**：鼓励引入新词（值越大，话题越多样）

### Stop Sequences

```typescript
{
  stop: ['\n', '---', 'END'],  // 遇到这些字符串时停止生成
}
```

### N（生成多个回复）

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: '给我的产品起个名字' }],
  n: 3,  // 生成 3 个不同的回复
  temperature: 0.9,
});

completion.choices.forEach((choice, i) => {
  console.log(`选项 ${i + 1}:`, choice.message.content);
});
```

## 💡 实用技巧

### 1. 上下文管理

对于长对话，需要管理 token 使用：

```typescript
function trimMessages(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  maxTokens: number = 3000
): OpenAI.Chat.ChatCompletionMessageParam[] {
  // 保留 system 消息
  const systemMsg = messages.find(m => m.role === 'system');
  const otherMessages = messages.filter(m => m.role !== 'system');

  // 从最新消息开始保留
  const trimmed = otherMessages.slice(-10); // 保留最近 10 条

  return systemMsg ? [systemMsg, ...trimmed] : trimmed;
}
```

### 2. 重试机制

```typescript
async function chatWithRetry(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  maxRetries: number = 3
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
      });
    } catch (error: any) {
      if (error.status === 429 && i < maxRetries - 1) {
        // 速率限制，等待后重试
        const delay = Math.pow(2, i) * 1000; // 指数退避
        console.log(`⏳ 等待 ${delay}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}
```

### 3. Token 计数

```typescript
import { encode } from 'gpt-tokenizer';

function countTokens(text: string): number {
  return encode(text).length;
}

function estimateMessageTokens(
  messages: OpenAI.Chat.ChatCompletionMessageParam[]
): number {
  let total = 0;
  for (const message of messages) {
    total += 4; // 每条消息的元数据开销
    if (typeof message.content === 'string') {
      total += countTokens(message.content);
    }
  }
  total += 2; // 回复的开销
  return total;
}
```

## 📊 成本优化

### 1. 选择合适的模型

```typescript
// 简单任务使用 gpt-3.5-turbo
const quickResponse = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: '1+1=?' }],
});

// 复杂任务使用 gpt-4
const complexResponse = await openai.chat.completions.create({
  model: 'gpt-4-turbo',
  messages: [{ role: 'user', content: '分析这段代码的性能问题...' }],
});
```

### 2. 限制输出长度

```typescript
{
  max_tokens: 500,  // 限制最大输出长度
}
```

### 3. 缓存常见请求

```typescript
const cache = new Map<string, string>();

async function cachedChat(prompt: string) {
  if (cache.has(prompt)) {
    console.log('📦 使用缓存');
    return cache.get(prompt);
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  });

  const result = response.choices[0].message.content;
  cache.set(prompt, result!);
  return result;
}
```

## 🔗 下一步

- [Embeddings](./03-Embeddings.md) - 文本向量化与语义搜索
- [Vision](./06-Vision.md) - 图像理解
- [最佳实践](./08-最佳实践.md) - 生产环境优化

## 📚 参考资料

- [Chat Completions API 参考](https://platform.openai.com/docs/api-reference/chat)
- [Function Calling 指南](https://platform.openai.com/docs/guides/function-calling)
- [JSON 模式文档](https://platform.openai.com/docs/guides/text-generation/json-mode)
