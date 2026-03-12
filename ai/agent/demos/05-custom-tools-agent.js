/**
 * Demo 5: 自定义工具 Agent
 *
 * 这个示例展示如何创建和使用自定义工具
 * 包括字符串处理、时间查询等自定义功能
 */

import { ChatOpenAI } from "@langchain/openai";
import { DynamicTool } from "@langchain/core/tools";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { getLLMConfig, checkEnvConfig } from "./config.js";

async function main() {
  // 检查环境配置
  checkEnvConfig();

  console.log("🔧 自定义工具 Agent 示例\n");
  console.log("=" .repeat(50));

  // 1. 初始化 LLM
  const model = new ChatOpenAI(getLLMConfig());

  // 2. 创建自定义工具

  // 工具1: 字符串反转
  const reverseStringTool = new DynamicTool({
    name: "reverse_string",
    description: "反转输入的字符串。输入应该是一个字符串。",
    func: async (input) => {
      return input.split("").reverse().join("");
    },
  });

  // 工具2: 获取当前时间
  const getCurrentTimeTool = new DynamicTool({
    name: "get_current_time",
    description: "获取当前的日期和时间。不需要输入参数。",
    func: async () => {
      const now = new Date();
      return `当前时间: ${now.toLocaleString("zh-CN", {
        timeZone: "Asia/Shanghai",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      })}`;
    },
  });

  // 工具3: 字符串长度计算
  const stringLengthTool = new DynamicTool({
    name: "string_length",
    description: "计算字符串的长度（字符数）。输入应该是一个字符串。",
    func: async (input) => {
      return `字符串 "${input}" 的长度是 ${input.length} 个字符`;
    },
  });

  // 工具4: 生成随机数
  const randomNumberTool = new DynamicTool({
    name: "random_number",
    description: "生成一个指定范围内的随机整数。输入格式: 'min,max'，例如 '1,100'",
    func: async (input) => {
      const [min, max] = input.split(",").map(Number);
      if (isNaN(min) || isNaN(max)) {
        return "错误: 请提供有效的数字范围，格式为 'min,max'";
      }
      const random = Math.floor(Math.random() * (max - min + 1)) + min;
      return `在 ${min} 到 ${max} 之间的随机数是: ${random}`;
    },
  });

  const tools = [
    reverseStringTool,
    getCurrentTimeTool,
    stringLengthTool,
    randomNumberTool,
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
    "现在几点了？",
    "帮我反转字符串 'Hello LangChain'",
    "计算 'LangChain Agent' 这个字符串有多少个字符",
    "生成一个 1 到 100 之间的随机数",
    "先获取当前时间，然后生成一个 1 到 10 的随机数",
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

  // 7. 展示工具列表
  console.log("\n🔧 可用的自定义工具:");
  console.log("-".repeat(50));
  tools.forEach((tool, index) => {
    console.log(`${index + 1}. ${tool.name}`);
    console.log(`   描述: ${tool.description}\n`);
  });
}

main().catch(console.error);
