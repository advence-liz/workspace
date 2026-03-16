/**
 * Function Calling 示例
 * 演示如何让 AI 调用自定义函数
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE,
});

// 模拟天气 API
async function getWeather(city: string, unit: string = 'celsius') {
  console.log(`   🌤️  调用天气 API: ${city}`);

  // 模拟 API 延迟
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 模拟天气数据
  const weatherData: Record<string, any> = {
    北京: { temperature: 15, condition: '晴朗', humidity: 45 },
    上海: { temperature: 20, condition: '多云', humidity: 60 },
    深圳: { temperature: 28, condition: '阴天', humidity: 75 },
  };

  const data = weatherData[city] || {
    temperature: 22,
    condition: '未知',
    humidity: 50,
  };

  return {
    city,
    ...data,
    unit,
  };
}

// 模拟数据库查询
async function searchDatabase(query: string) {
  console.log(`   🔍 搜索数据库: "${query}"`);

  await new Promise((resolve) => setTimeout(resolve, 300));

  const mockData: Record<string, any> = {
    用户数: { count: 1520, trend: '上升' },
    订单数: { count: 3240, trend: '稳定' },
    收入: { amount: '125,000', currency: 'CNY' },
  };

  return mockData[query] || { message: '未找到相关数据' };
}

// 定义可用的函数
const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: '获取指定城市的实时天气信息',
      parameters: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
            description: '城市名称，如：北京、上海、深圳',
          },
          unit: {
            type: 'string',
            enum: ['celsius', 'fahrenheit'],
            description: '温度单位，默认为摄氏度',
          },
        },
        required: ['city'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_database',
      description: '搜索业务数据库，获取统计信息',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: '查询内容，如：用户数、订单数、收入等',
          },
        },
        required: ['query'],
      },
    },
  },
];

async function runConversation(userMessage: string) {
  console.log(`\n💬 用户: ${userMessage}\n`);

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: '你是一个有帮助的助手，可以查询天气和业务数据。',
    },
    { role: 'user', content: userMessage },
  ];

  try {
    // 第一次调用：让 AI 决定是否需要调用函数
    console.log('🤖 AI 正在分析...\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      tools,
      tool_choice: 'auto',
    });

    const responseMessage = response.choices[0].message;
    messages.push(responseMessage);

    // 检查是否需要调用函数
    if (responseMessage.tool_calls) {
      console.log('🔧 需要调用函数:\n');

      // 处理每个函数调用
      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        console.log(`   函数: ${functionName}`);
        console.log(`   参数:`, functionArgs);

        // 执行对应的函数
        let functionResponse: any;

        if (functionName === 'get_weather') {
          functionResponse = await getWeather(
            functionArgs.city,
            functionArgs.unit
          );
        } else if (functionName === 'search_database') {
          functionResponse = await searchDatabase(functionArgs.query);
        }

        console.log(`   结果:`, functionResponse);
        console.log();

        // 将函数结果添加到消息历史
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(functionResponse),
        });
      }

      // 第二次调用：基于函数结果生成最终回复
      console.log('🤖 AI 正在生成回复...\n');

      const finalResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
      });

      const finalMessage = finalResponse.choices[0].message.content;
      console.log(`🤖 AI: ${finalMessage}\n`);

      return finalMessage;
    } else {
      // 不需要调用函数，直接返回
      console.log(`🤖 AI: ${responseMessage.content}\n`);
      return responseMessage.content;
    }
  } catch (error: any) {
    console.error('❌ 错误:', error.message);
  }
}

// 运行多个示例
async function main() {
  console.log('🚀 Function Calling 示例\n');
  console.log('='.repeat(60));

  // 示例 1: 查询天气
  await runConversation('北京今天天气怎么样？');

  console.log('='.repeat(60));

  // 示例 2: 查询业务数据
  await runConversation('我们现在有多少用户？');

  console.log('='.repeat(60));

  // 示例 3: 复杂查询（需要调用多个函数）
  await runConversation('对比一下北京和上海的天气，然后告诉我最近的订单数');

  console.log('='.repeat(60));

  // 示例 4: 不需要调用函数
  await runConversation('什么是机器学习？');
}

main();
