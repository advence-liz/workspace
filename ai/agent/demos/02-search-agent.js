/**
 * Demo 2: 搜索 Agent
 *
 * 这个示例展示如何创建一个可以搜索互联网的 Agent
 * 使用 DuckDuckGoSearch，无需任何 API Key，完全免费
 */

import { ChatOpenAI } from "@langchain/openai";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { getLLMConfig, checkEnvConfig } from "./config.js";

async function main() {
  // 检查环境配置
  checkEnvConfig();

  console.log("🔍 搜索 Agent 示例\n");
  console.log("=".repeat(50));

  // 1. 初始化 LLM
  const model = new ChatOpenAI(getLLMConfig());

  // 2. 定义搜索工具（DuckDuckGo 无需 API Key）
  const tools = [
    new DuckDuckGoSearch({ maxResults: 5 }),
  ];

  // 3. 获取 prompt
  const prompt = await pull("hwchase17/react");

  // 4. 创建 Agent
  const agent = await createReactAgent({
    llm: model,
    tools,
    prompt,
  });

  // 5. 创建执行器
  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    verbose: true,
  });

  // 6. 运行示例
  const examples = [
    "2024年诺贝尔物理学奖得主是谁？",
    "最新的 iPhone 型号是什么？",
  ];

  for (const question of examples) {
    console.log(`\n📝 问题: ${question}`);
    console.log("-".repeat(50));

    const result = await agentExecutor.invoke({
      input: question,
    });

    console.log(`\n✅ 答案: ${result.output}\n`);
    console.log("=".repeat(50));
  }
}

main().catch(console.error);
