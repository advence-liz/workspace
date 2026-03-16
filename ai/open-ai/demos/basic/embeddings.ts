/**
 * Embeddings 示例
 * 演示文本向量化和语义相似度计算
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE,
});

// 计算余弦相似度
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

async function embeddingsDemo() {
  console.log('🔢 Embeddings 示例\n');

  const texts = [
    'TypeScript 是 JavaScript 的超集',
    'TypeScript 为 JavaScript 添加了类型系统',
    '今天天气很好',
    'Python 是一门流行的编程语言',
  ];

  console.log('📝 待分析的文本:');
  texts.forEach((text, i) => {
    console.log(`   ${i + 1}. ${text}`);
  });
  console.log();

  try {
    // 获取所有文本的 embeddings
    console.log('⏳ 正在生成向量...\n');

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
    });

    const embeddings = response.data.map((item) => item.embedding);

    // 计算第一句话与其他句子的相似度
    console.log('📊 相似度分析（与第 1 句话对比）:\n');

    const baseEmbedding = embeddings[0];

    for (let i = 1; i < embeddings.length; i++) {
      const similarity = cosineSimilarity(baseEmbedding, embeddings[i]);
      const percentage = (similarity * 100).toFixed(2);

      console.log(`   ${i + 1}. "${texts[i]}"`);
      console.log(`      相似度: ${percentage}%`);

      // 判断相似程度
      if (similarity > 0.8) {
        console.log('      ✅ 高度相似');
      } else if (similarity > 0.5) {
        console.log('      🟡 中度相似');
      } else {
        console.log('      ❌ 不相似');
      }
      console.log();
    }

    // 使用统计
    console.log('📈 使用统计:');
    console.log(`   总 tokens: ${response.usage.total_tokens}`);
    console.log(`   向量维度: ${embeddings[0].length}`);
  } catch (error: any) {
    console.error('❌ 错误:', error.message);
  }
}

// 运行示例
embeddingsDemo();
