/**
 * Demo 4: 带记忆的 Agent
 *
 * 这个示例展示如何创建一个具有对话记忆的 Agent
 * Agent 可以记住之前的对话内容，进行连贯的多轮对话
 *
 * 关键点：使用简洁的自定义 Prompt（更通用，无品牌限定）
 */

import { ChatOpenAI } from "@langchain/openai";
import { Calculator } from "@langchain/community/tools/calculator";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { BufferMemory } from "langchain/memory";
import { PromptTemplate } from "@langchain/core/prompts";
import { getLLMConfig, checkEnvConfig } from "./config.js";

async function main() {
  // 检查环境配置
  checkEnvConfig();

  console.log("💭 带记忆的 Agent 示例\n");
  console.log("=" .repeat(50));

  // 1. 初始化 LLM
  const model = new ChatOpenAI(getLLMConfig());

  // 2. 定义工具
  const tools = [
    new Calculator(),
  ];

  // 3. 创建简洁的自定义 Prompt（支持 chat_history）
  //
  // 为什么不用 hwchase17/react-chat？
  // - react-chat 包含 "OpenAI" 品牌信息，不够通用
  // - react-chat 很冗长（1796 字符 vs 600 字符）
  // - 自定义版本更简洁，节省 tokens，适配任何 API
  const prompt = PromptTemplate.fromTemplate(`Answer the following questions as best you can. You have access to the following tools:

{tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Previous conversation history:
{chat_history}

Begin!

Question: {input}
Thought:{agent_scratchpad}`);

  // 4. 创建 Agent
  const agent = await createReactAgent({
    llm: model,
    tools,
    prompt,
  });

  // 5. 创建记忆
  // memoryKey 必须是 "chat_history"，与 Prompt 中的变量名一致
  const memory = new BufferMemory({
    memoryKey: "chat_history",
    returnMessages: true,
  });

  // 6. 创建执行器（带记忆和错误处理）
  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    memory,
    verbose: true,
    handleParsingErrors: true, // 启用错误处理
  });

  // 7. 模拟多轮对话
  const conversation = [
    "请帮我计算 100 + 200",
    "把刚才的结果乘以 3",
    "再把结果除以 2",
    "最终的结果是多少？",
  ];

  console.log("🗣️  开始多轮对话...\n");
  console.log("💡 提示: Agent 会通过 chat_history 记住之前的计算结果\n");

  for (let i = 0; i < conversation.length; i++) {
    const input = conversation[i];
    console.log(`\n[第 ${i + 1} 轮]`);
    console.log(`👤 用户: ${input}`);
    console.log("-".repeat(50));

    try {
      const result = await agentExecutor.invoke({
        input,
      });

      console.log(`\n🤖 Agent: ${result.output}\n`);
    } catch (error) {
      console.log(`\n❌ 错误: ${error.message}\n`);
    }

    console.log("=".repeat(50));
  }

  // 8. 显示记忆内容
  console.log("\n📚 对话记忆:");
  console.log("-".repeat(50));
  const memoryVariables = await memory.loadMemoryVariables({});
  console.log("记忆中保存了以下对话:");

  if (memoryVariables.chat_history && memoryVariables.chat_history.length > 0) {
    memoryVariables.chat_history.forEach((msg, idx) => {
      const role = msg._getType() === "human" ? "👤 用户" : "🤖 Agent";
      console.log(`\n${idx + 1}. ${role}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
    });
  } else {
    console.log("(暂无记忆)");
  }

  console.log("\n");
  console.log("💡 关键知识点:");
  console.log("-".repeat(50));
  console.log("1. Prompt 模板必须包含 {chat_history} 变量");
  console.log("2. BufferMemory 的 memoryKey 必须与 Prompt 变量名一致");
  console.log("3. 使用简洁的自定义 Prompt，而不是 react-chat");
  console.log("4. 原因：react-chat 包含 OpenAI 品牌信息，不够通用");
  console.log("5. 自定义版本更简洁（600 vs 1796 字符），节省 tokens");
  console.log("\nPrompt 选择建议:");
  console.log("  • hwchase17/react       - 不含 chat_history，单次查询");
  console.log("  • hwchase17/react-chat  - 含 chat_history，但有品牌限定");
  console.log("  • 自定义简洁版          - 含 chat_history，通用简洁 ✅");
}

main().catch(console.error);
