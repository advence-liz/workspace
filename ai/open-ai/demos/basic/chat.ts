/**
 * 基础聊天示例
 * 演示最简单的 OpenAI API 调用
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE,
});

async function basicChat() {
  console.log('🤖 基础聊天示例\n');

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一个友好的 AI 助手，擅长用简洁的语言回答问题。',
        },
        {
          role: 'user',
          content: '用一句话解释什么是 TypeScript？',
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const response = completion.choices[0].message.content;
    console.log('📝 AI 回复:', response);

    // 显示使用统计
    console.log('\n📊 Token 使用统计:');
    console.log(`   输入: ${completion.usage?.prompt_tokens} tokens`);
    console.log(`   输出: ${completion.usage?.completion_tokens} tokens`);
    console.log(`   总计: ${completion.usage?.total_tokens} tokens`);

    // 估算成本（gpt-3.5-turbo 价格）
    const cost =
      ((completion.usage?.prompt_tokens || 0) * 0.0015 +
        (completion.usage?.completion_tokens || 0) * 0.002) /
      1000;
    console.log(`   成本: $${cost.toFixed(6)}`);
  } catch (error: any) {
    console.error('❌ 错误:', error.message);
  }
}

// 运行示例
basicChat();
