# 03 - Embeddings（文本向量化）

> 将文本转换为数字向量，实现语义搜索和 RAG 系统

## 📝 什么是 Embeddings？

Embeddings 是将文本转换为高维数字向量的技术。相似含义的文本会产生相似的向量。

**应用场景**：
- 语义搜索
- 文档问答（RAG）
- 推荐系统
- 聚类分析
- 异常检测

## 🎯 基础用法

### 单个文本向量化

```typescript
import OpenAI from 'openai';

const openai = new OpenAI();

const response = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: 'TypeScript 是 JavaScript 的超集',
});

const embedding = response.data[0].embedding;

console.log('向量维度:', embedding.length); // 1536
console.log('向量前 5 个值:', embedding.slice(0, 5));
// [0.0023, -0.0156, 0.0089, ...]
```

### 批量向量化

```typescript
const texts = [
  'Python 是一门编程语言',
  'JavaScript 用于 Web 开发',
  '今天天气很好',
];

const response = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: texts,
});

const embeddings = response.data.map((item) => item.embedding);

console.log(`生成了 ${embeddings.length} 个向量`);
```

## 🔢 可用模型

| 模型 | 维度 | 价格 | 适用场景 |
|------|------|------|---------|
| **text-embedding-3-small** | 1536 | $0.02/1M tokens | 通用，性价比高 |
| **text-embedding-3-large** | 3072 | $0.13/1M tokens | 高精度任务 |
| **text-embedding-ada-002** | 1536 | $0.10/1M tokens | 旧版（不推荐） |

**推荐**：大多数场景使用 `text-embedding-3-small` 即可。

## 📏 相似度计算

### 余弦相似度

最常用的相似度度量方式：

```typescript
function cosineSimilarity(a: number[], b: number[]): number {
  // 计算点积
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);

  // 计算模长
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  // 余弦相似度
  return dotProduct / (magnitudeA * magnitudeB);
}

// 使用
const similarity = cosineSimilarity(embedding1, embedding2);
console.log('相似度:', similarity); // 0 到 1 之间，1 表示完全相同
```

### 欧氏距离

```typescript
function euclideanDistance(a: number[], b: number[]): number {
  const sumSquares = a.reduce((sum, val, i) => {
    const diff = val - b[i];
    return sum + diff * diff;
  }, 0);

  return Math.sqrt(sumSquares);
}
```

## 🔍 语义搜索

### 简单搜索引擎

```typescript
interface Document {
  id: string;
  text: string;
  embedding?: number[];
}

class SemanticSearch {
  private documents: Document[] = [];

  // 添加文档
  async addDocument(id: string, text: string) {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    this.documents.push({
      id,
      text,
      embedding: response.data[0].embedding,
    });
  }

  // 批量添加
  async addDocuments(docs: Array<{ id: string; text: string }>) {
    const texts = docs.map((d) => d.text);

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
    });

    docs.forEach((doc, i) => {
      this.documents.push({
        ...doc,
        embedding: response.data[i].embedding,
      });
    });
  }

  // 搜索
  async search(query: string, topK: number = 5) {
    // 查询向量化
    const queryResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    const queryEmbedding = queryResponse.data[0].embedding;

    // 计算相似度
    const results = this.documents
      .map((doc) => ({
        ...doc,
        similarity: cosineSimilarity(queryEmbedding, doc.embedding!),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    return results;
  }
}

// 使用
const search = new SemanticSearch();

await search.addDocuments([
  { id: '1', text: 'TypeScript 是 JavaScript 的超集' },
  { id: '2', text: 'Python 是一门流行的编程语言' },
  { id: '3', text: '今天天气很好' },
]);

const results = await search.search('什么是 TS？');
console.log(results);
// [
//   { id: '1', text: 'TypeScript...', similarity: 0.89 },
//   ...
// ]
```

## 🤖 RAG 系统

结合 Embeddings 和 Chat Completions 实现文档问答：

```typescript
async function ragQuery(query: string, documents: Document[]) {
  // 1. 检索相关文档
  const search = new SemanticSearch();
  await search.addDocuments(documents);
  const relevantDocs = await search.search(query, 3);

  // 2. 构建上下文
  const context = relevantDocs
    .map((doc) => doc.text)
    .join('\n\n');

  // 3. 生成回答
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: '你是一个问答助手。基于提供的文档回答问题。',
      },
      {
        role: 'user',
        content: `文档：\n${context}\n\n问题：${query}`,
      },
    ],
    temperature: 0.3,
  });

  return response.choices[0].message.content;
}

// 使用
const answer = await ragQuery('TypeScript 是什么？', documents);
console.log(answer);
```

完整示例见：[demos/use-cases/rag-system.ts](../demos/use-cases/rag-system.ts)

## 🎨 高级用法

### 1. 调整向量维度

```typescript
// text-embedding-3-small 支持自定义维度
const response = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: 'Hello',
  dimensions: 512, // 默认 1536，可以降低到 512
});

// 优点：更小的存储空间，更快的搜索速度
// 缺点：精度略有下降
```

### 2. 文本分块

长文本需要分块处理：

```typescript
function chunkText(text: string, maxTokens: number = 512): string[] {
  // 简单按句子分块（实际应用中使用更智能的分块策略）
  const sentences = text.split(/[。！？.!?]+/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length < maxTokens * 4) {
      // 粗略估计 1 token ≈ 4 字符
      currentChunk += sentence + '。';
    } else {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = sentence + '。';
    }
  }

  if (currentChunk) chunks.push(currentChunk);

  return chunks;
}

// 使用
const longText = '...很长的文本...';
const chunks = chunkText(longText);

const embeddings = await Promise.all(
  chunks.map(async (chunk) => {
    const res = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: chunk,
    });
    return { chunk, embedding: res.data[0].embedding };
  })
);
```

### 3. 缓存向量

避免重复计算：

```typescript
import fs from 'fs';

class EmbeddingCache {
  private cache: Map<string, number[]> = new Map();
  private cacheFile = './embeddings-cache.json';

  constructor() {
    this.load();
  }

  async get(text: string): Promise<number[]> {
    // 检查缓存
    if (this.cache.has(text)) {
      console.log('💾 使用缓存');
      return this.cache.get(text)!;
    }

    // 生成新向量
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    const embedding = response.data[0].embedding;

    // 存入缓存
    this.cache.set(text, embedding);
    this.save();

    return embedding;
  }

  private load() {
    try {
      const data = fs.readFileSync(this.cacheFile, 'utf-8');
      const obj = JSON.parse(data);
      this.cache = new Map(Object.entries(obj));
    } catch {
      // 缓存文件不存在
    }
  }

  private save() {
    const obj = Object.fromEntries(this.cache);
    fs.writeFileSync(this.cacheFile, JSON.stringify(obj));
  }
}
```

## 💰 成本优化

### 1. 批量处理

```typescript
// ❌ 低效：逐个请求
for (const text of texts) {
  await openai.embeddings.create({ input: text, ... });
}

// ✅ 高效：批量请求
await openai.embeddings.create({
  input: texts, // 一次最多 2048 个文本
  model: 'text-embedding-3-small',
});
```

### 2. 选择合适的模型

```typescript
// 一般任务：使用 small 模型
const embedding = await openai.embeddings.create({
  model: 'text-embedding-3-small', // 便宜 6.5 倍
  input: text,
});

// 高精度任务：使用 large 模型
const embedding = await openai.embeddings.create({
  model: 'text-embedding-3-large', // 更高精度
  input: text,
});
```

### 3. 降低维度

```typescript
// 存储空间节省 66%，速度提升 3 倍
const embedding = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: text,
  dimensions: 512, // 从 1536 降到 512
});
```

## 🔧 实用工具

### 向量数据库集成

推荐使用向量数据库存储和检索：

- **Pinecone** - 托管服务
- **Weaviate** - 开源
- **Qdrant** - 高性能
- **Chroma** - 轻量级

示例（Chroma）：

```typescript
import { ChromaClient } from 'chromadb';

const client = new ChromaClient();
const collection = await client.createCollection({ name: 'documents' });

// 添加文档
await collection.add({
  ids: ['1', '2', '3'],
  documents: ['text1', 'text2', 'text3'],
  embeddings: [embedding1, embedding2, embedding3],
});

// 搜索
const results = await collection.query({
  queryEmbeddings: [queryEmbedding],
  nResults: 5,
});
```

## 📊 性能基准

| 操作 | text-embedding-3-small | text-embedding-3-large |
|------|----------------------|----------------------|
| 单次请求 | ~100ms | ~150ms |
| 批量 100 个 | ~500ms | ~800ms |
| 成本（1M tokens） | $0.02 | $0.13 |

## 🔗 下一步

- [RAG 系统示例](../demos/use-cases/rag-system.ts)
- [Chat Completions](./02-Chat-Completions.md)
- [最佳实践](./08-最佳实践.md)

## 📚 参考资料

- [Embeddings API 文档](https://platform.openai.com/docs/guides/embeddings)
- [向量数据库对比](https://github.com/openai/openai-cookbook/blob/main/examples/vector_databases/Using_vector_databases_for_embeddings_search.ipynb)
