/**
 * Demo 1: 基础 ReAct Agent
 *
 * 这个示例展示了最基础的 ReAct (Reasoning + Acting) Agent
 * Agent 会根据问题进行推理，并使用提供的工具来回答问题
 */

import { ChatOpenAI } from "@langchain/openai";
import { Calculator } from "@langchain/community/tools/calculator";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { getLLMConfig, checkEnvConfig } from "./config.js";

async function main() {
  // 检查环境配置
  checkEnvConfig();

  console.log("🤖 基础 ReAct Agent 示例\n");
  console.log("=".repeat(50));

  // 1. 初始化 LLM
  const model = new ChatOpenAI(getLLMConfig());

  // 2. 定义工具
  const tools = [
    new Calculator(), // 内置计算器工具
  ];

  // 3. 从 Hub 拉取 ReAct prompt
  const prompt = await pull("hwchase17/react");

  // 4. 创建 Agent
  const agent = await createReactAgent({
    llm: model,
    tools,
    prompt,
  });

  // 5. 创建 Agent 执行器
  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    verbose: true, // 显示详细的推理过程
  });

  // 6. 运行示例
  const examples = [
    "123 加 456 等于多少？",
    "如果一个圆的半径是 5，它的面积是多少？（使用 π = 3.14159）",
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
