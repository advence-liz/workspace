/**
 * Demo 3: 计算器 Agent
 *
 * 这个示例展示如何创建一个专注于数学计算的 Agent
 * 演示了 Agent 如何使用工具来解决复杂的数学问题
 */

import { ChatOpenAI } from "@langchain/openai";
import { Calculator } from "@langchain/community/tools/calculator";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { getLLMConfig, checkEnvConfig } from "./config.js";

async function main() {
  // 检查环境配置
  checkEnvConfig();

  console.log("🧮 计算器 Agent 示例\n");
  console.log("=" .repeat(50));

  // 1. 初始化 LLM
  const model = new ChatOpenAI(getLLMConfig());

  // 2. 定义计算器工具
  const tools = [
    new Calculator(),
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
    maxIterations: 10, // 设置最大迭代次数
  });

  // 6. 运行复杂的数学问题
  const examples = [
    "计算 (123 + 456) * 789 的结果",
    "如果一个正方形的边长是 12.5 厘米，它的面积和周长分别是多少？",
    "一个三角形的三边长分别是 3、4、5，使用海伦公式计算它的面积",
    "2的10次方是多少？",
  ];

  for (const question of examples) {
    console.log(`\n📝 问题: ${question}`);
    console.log("-".repeat(50));

    try {
      const result = await agentExecutor.invoke({
        input: question,
      });

      console.log(`\n✅ 答案: ${result.output}\n`);
    } catch (error) {
      console.log(`\n❌ 错误: ${error.message}\n`);
    }

    console.log("=".repeat(50));
  }
}

main().catch(console.error);
