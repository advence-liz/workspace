/**
 * 流式响应示例
 * 演示如何实现打字机效果
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE,
});

async function streamChat() {
  console.log('🌊 流式响应示例\n');
  console.log('💬 用户: 写一首关于编程的短诗\n');
  console.log('🤖 AI: ');

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一个诗人，擅长创作简短优美的诗歌。',
        },
        {
          role: 'user',
          content: '写一首关于编程的短诗，4 行即可',
        },
      ],
      stream: true,
      temperature: 0.8,
    });

    let fullResponse = '';

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;

      // 输出内容
      if (delta?.content) {
        fullResponse += delta.content;
        process.stdout.write(delta.content);
      }

      // 检查完成原因
      const finishReason = chunk.choices[0]?.finish_reason;
      if (finishReason) {
        console.log('\n\n✅ 完成原因:', finishReason);
      }
    }

    console.log('\n\n📝 完整响应:');
    console.log(fullResponse);
  } catch (error: any) {
    console.error('\n❌ 错误:', error.message);
  }
}

// 运行示例
streamChat();
