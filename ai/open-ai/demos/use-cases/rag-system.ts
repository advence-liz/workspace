/**
 * RAG (Retrieval-Augmented Generation) 系统示例
 * 基于 Embeddings 的文档问答系统
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE,
});

// 知识库文档
const documents = [
  {
    id: '1',
    title: 'TypeScript 简介',
    content:
      'TypeScript 是 JavaScript 的超集，由 Microsoft 开发。它添加了可选的静态类型和基于类的面向对象编程。TypeScript 代码会被编译成纯 JavaScript，可以在任何支持 JavaScript 的环境中运行。',
  },
  {
    id: '2',
    title: 'TypeScript 类型系统',
    content:
      'TypeScript 的类型系统包括基础类型（string, number, boolean）、数组、元组、枚举、any、void、null、undefined 等。还支持接口（interface）、类型别名（type）、泛型（generics）等高级特性。',
  },
  {
    id: '3',
    title: 'React 与 TypeScript',
    content:
      '在 React 项目中使用 TypeScript 可以提供更好的类型安全。可以为组件的 props 和 state 定义类型，使用 React.FC 定义函数组件，使用泛型定义 hooks 的类型。这样可以在开发时发现潜在错误。',
  },
  {
    id: '4',
    title: 'Node.js 与 TypeScript',
    content:
      'Node.js 项目中使用 TypeScript 需要安装 @types/node 包。可以使用 ts-node 直接运行 TypeScript 文件，或使用 tsc 编译后运行。常见的配置包括设置 module 为 commonjs，target 为 ES2020 等。',
  },
  {
    id: '5',
    title: 'Python 简介',
    content:
      'Python 是一种高级编程语言，以其简洁的语法和强大的功能而闻名。它支持多种编程范式，包括面向对象、命令式、函数式和过程式编程。Python 广泛应用于 Web 开发、数据科学、人工智能等领域。',
  },
];

interface Document {
  id: string;
  title: string;
  content: string;
  embedding?: number[];
}

// 计算余弦相似度
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * 为文档生成 embeddings
 */
async function generateEmbeddings(
  docs: Document[]
): Promise<Document[]> {
  console.log('📚 正在为文档生成向量...\n');

  const texts = docs.map((doc) => `${doc.title}\n${doc.content}`);

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
  });

  const docsWithEmbeddings = docs.map((doc, i) => ({
    ...doc,
    embedding: response.data[i].embedding,
  }));

  console.log(`✅ 已为 ${docs.length} 个文档生成向量\n`);

  return docsWithEmbeddings;
}

/**
 * 搜索相关文档
 */
async function searchDocuments(
  query: string,
  docs: Document[],
  topK: number = 3
): Promise<Document[]> {
  console.log(`🔍 搜索: "${query}"\n`);

  // 为查询生成 embedding
  const queryResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });

  const queryEmbedding = queryResponse.data[0].embedding;

  // 计算相似度并排序
  const results = docs
    .map((doc) => ({
      doc,
      similarity: cosineSimilarity(queryEmbedding, doc.embedding!),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);

  console.log('📊 相关文档:\n');
  results.forEach((result, i) => {
    console.log(`   ${i + 1}. ${result.doc.title}`);
    console.log(`      相似度: ${(result.similarity * 100).toFixed(2)}%`);
  });
  console.log();

  return results.map((r) => r.doc);
}

/**
 * 基于检索结果生成回答
 */
async function generateAnswer(
  query: string,
  relevantDocs: Document[]
): Promise<string> {
  console.log('🤖 正在生成回答...\n');

  // 构建上下文
  const context = relevantDocs
    .map((doc) => `【${doc.title}】\n${doc.content}`)
    .join('\n\n');

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `你是一个知识问答助手。基于提供的文档回答用户问题。
如果文档中没有相关信息，请明确告知用户。
回答要准确、简洁、友好。`,
      },
      {
        role: 'user',
        content: `参考文档：

${context}

问题：${query}

请基于上述文档回答问题。`,
      },
    ],
    temperature: 0.3,
    max_tokens: 500,
  });

  return response.choices[0].message.content || '';
}

/**
 * RAG 问答流程
 */
async function ragQuery(query: string, docs: Document[]) {
  console.log('='.repeat(60));
  console.log(`\n💬 用户问题: ${query}\n`);

  try {
    // 1. 检索相关文档
    const relevantDocs = await searchDocuments(query, docs, 2);

    // 2. 生成回答
    const answer = await generateAnswer(query, relevantDocs);

    console.log('🤖 AI 回答:\n');
    console.log(answer);
    console.log('\n' + '='.repeat(60) + '\n');

    return answer;
  } catch (error: any) {
    console.error('❌ 错误:', error.message);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 RAG 系统示例\n');
  console.log('='.repeat(60) + '\n');

  try {
    // 初始化：为所有文档生成 embeddings
    const docsWithEmbeddings = await generateEmbeddings(documents);

    // 示例查询
    const queries = [
      'TypeScript 是什么？',
      '如何在 React 中使用 TypeScript？',
      'Python 有什么特点？',
      'TypeScript 的类型系统包括哪些内容？',
    ];

    // 依次处理每个查询
    for (const query of queries) {
      await ragQuery(query, docsWithEmbeddings);
    }

    console.log('✅ 所有查询完成');
  } catch (error: any) {
    console.error('❌ 系统错误:', error.message);
  }
}

main();
