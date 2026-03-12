/**
 * Demo 6: 多 Agent 协作
 *
 * 这个示例展示如何创建多个专门的 Agent 并让它们协作完成任务
 * 包括一个数学专家 Agent 和一个文本处理专家 Agent
 */

import { ChatOpenAI } from "@langchain/openai";
import { Calculator } from "@langchain/community/tools/calculator";
import { DynamicTool } from "@langchain/core/tools";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { getLLMConfig, checkEnvConfig } from "./config.js";

// 创建数学专家 Agent
async function createMathAgent() {
  const model = new ChatOpenAI(getLLMConfig());

  const tools = [new Calculator()];
  const prompt = await pull("hwchase17/react");
  const agent = await createReactAgent({ llm: model, tools, prompt });

  return new AgentExecutor({
    agent,
    tools,
    verbose: false,
  });
}

// 创建文本处理专家 Agent
async function createTextAgent() {
  const model = new ChatOpenAI(getLLMConfig());

  const tools = [
    new DynamicTool({
      name: "count_words",
      description: "计算文本中的单词数量",
      func: async (text) => {
        const words = text.trim().split(/\s+/).filter(w => w.length > 0);
        return `文本包含 ${words.length} 个单词`;
      },
    }),
    new DynamicTool({
      name: "to_uppercase",
      description: "将文本转换为大写",
      func: async (text) => text.toUpperCase(),
    }),
    new DynamicTool({
      name: "extract_numbers",
      description: "从文本中提取所有数字",
      func: async (text) => {
        const numbers = text.match(/\d+/g) || [];
        return `提取的数字: ${numbers.join(", ")}`;
      },
    }),
  ];

  const prompt = await pull("hwchase17/react");
  const agent = await createReactAgent({ llm: model, tools, prompt });

  return new AgentExecutor({
    agent,
    tools,
    verbose: false,
  });
}

async function main() {
  // 检查环境配置
  checkEnvConfig();

  console.log("👥 多 Agent 协作示例\n");
  console.log("=" .repeat(50));

  // 创建两个专家 Agent
  console.log("⚙️  正在初始化 Agent...");
  const mathAgent = await createMathAgent();
  const textAgent = await createTextAgent();
  console.log("✅ Agent 初始化完成\n");

  // 创建协调器工具
  const mathExpertTool = new DynamicTool({
    name: "math_expert",
    description: "数学专家，可以进行各种数学计算。输入应该是一个数学问题。",
    func: async (input) => {
      console.log(`  📊 调用数学专家: ${input}`);
      const result = await mathAgent.invoke({ input });
      return result.output;
    },
  });

  const textExpertTool = new DynamicTool({
    name: "text_expert",
    description: "文本处理专家，可以分析和处理文本。输入应该是文本处理任务。",
    func: async (input) => {
      console.log(`  📝 调用文本专家: ${input}`);
      const result = await textAgent.invoke({ input });
      return result.output;
    },
  });

  // 创建协调器 Agent
  const coordinatorModel = new ChatOpenAI(getLLMConfig());

  const coordinatorTools = [mathExpertTool, textExpertTool];
  const prompt = await pull("hwchase17/react");
  const coordinatorAgent = await createReactAgent({
    llm: coordinatorModel,
    tools: coordinatorTools,
    prompt,
  });

  const coordinator = new AgentExecutor({
    agent: coordinatorAgent,
    tools: coordinatorTools,
    verbose: true,
  });

  // 运行复杂任务
  const tasks = [
    "计算 123 * 456，然后告诉我结果有多少位数字",
    "分析文本 'Hello World 123 456' 中有多少个单词和数字",
    "计算 100 + 200 + 300 的和，然后将结果转换为大写文本",
  ];

  for (const task of tasks) {
    console.log(`\n📋 任务: ${task}`);
    console.log("-".repeat(50));

    const result = await coordinator.invoke({ input: task });

    console.log(`\n✅ 最终结果: ${result.output}\n`);
    console.log("=".repeat(50));
  }
}

main().catch(console.error);
