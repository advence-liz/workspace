/**
 * Demo 列表
 * 运行 npm run demo:list 查看所有可用示例
 */

console.log(`
🚀 OpenAI API 示例列表

📁 基础示例 (demos/basic/)
  1. chat.ts           - 基础聊天对话
  2. stream.ts         - 流式响应（打字机效果）
  3. embeddings.ts     - 文本向量化与相似度计算

📁 高级示例 (demos/advanced/)
  4. function-calling.ts - 函数调用（工具使用）
  5. vision.ts          - 图像理解
  6. audio.ts           - 语音处理（需要创建）
  7. assistant.ts       - AI 助手（需要创建）

📁 实际应用 (demos/use-cases/)
  8. rag-system.ts      - RAG 文档问答系统

运行方式：
  npm run demo:chat              # 基础聊天
  npm run demo:stream            # 流式响应
  npm run demo:function          # 函数调用
  npm run demo:embeddings        # 向量化
  npm run demo:vision            # 图像理解
  npm run demo:rag               # RAG 系统

或直接运行：
  npx tsx demos/basic/chat.ts
`);
