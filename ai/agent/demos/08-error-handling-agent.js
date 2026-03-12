/**
 * Demo 8: 错误处理 Agent
 *
 * 这个示例展示如何在 Agent 中优雅地处理错误
 * 包括工具执行失败、超时、重试等场景
 */

import { ChatOpenAI } from "@langchain/openai";
import { DynamicTool } from "@langchain/core/tools";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { getLLMConfig, checkEnvConfig } from "./config.js";

async function main() {
  // 检查环境配置
  checkEnvConfig();

  console.log("⚠️  错误处理 Agent 示例\n");
  console.log("=" .repeat(50));

  // 1. 初始化 LLM
  const model = new ChatOpenAI(getLLMConfig());

  // 2. 创建可能失败的工具

  // 工具1: 不稳定的 API 调用（模拟）
  let apiCallCount = 0;
  const unstableApiTool = new DynamicTool({
    name: "unstable_api",
    description: "调用一个不稳定的 API（可能会失败）。输入任意文本。",
    func: async (input) => {
      apiCallCount++;
      console.log(`  🔄 API 调用次数: ${apiCallCount}`);

      // 前两次调用会失败
      if (apiCallCount <= 2) {
        throw new Error("API 暂时不可用，请稍后重试");
      }

      return `API 调用成功！输入: ${input}`;
    },
  });

  // 工具2: 需要验证的工具
  const validateInputTool = new DynamicTool({
    name: "validate_email",
    description: "验证电子邮件地址是否有效。输入应该是一个电子邮件地址。",
    func: async (input) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(input)) {
        return `错误: "${input}" 不是有效的电子邮件地址`;
      }

      return `✅ "${input}" 是有效的电子邮件地址`;
    },
  });

  // 工具3: 有超时限制的工具
  const slowOperationTool = new DynamicTool({
    name: "slow_operation",
    description: "执行一个耗时操作。输入应该是等待的秒数。",
    func: async (input) => {
      const seconds = parseInt(input);

      if (isNaN(seconds)) {
        return "错误: 请提供有效的秒数";
      }

      if (seconds > 5) {
        return "错误: 操作超时（最大等待时间为5秒）";
      }

      // 模拟耗时操作
      await new Promise(resolve => setTimeout(resolve, seconds * 1000));

      return `操作完成，耗时 ${seconds} 秒`;
    },
  });

  // 工具4: 需要权限的工具
  const restrictedTool = new DynamicTool({
    name: "restricted_operation",
    description: "执行需要管理员权限的操作。输入应该是用户角色（admin 或 user）。",
    func: async (input) => {
      const role = input.toLowerCase().trim();

      if (role !== "admin") {
        return "错误: 权限不足，需要管理员权限";
      }

      return "✅ 操作成功执行（管理员权限）";
    },
  });

  const tools = [
    unstableApiTool,
    validateInputTool,
    slowOperationTool,
    restrictedTool,
  ];

  // 3. 创建 Agent（带错误处理配置）
  const prompt = await pull("hwchase17/react");
  const agent = await createReactAgent({
    llm: model,
    tools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    verbose: true,
    maxIterations: 5, // 限制最大迭代次数
    handleParsingErrors: true, // 启用解析错误处理
  });

  // 4. 测试各种错误场景
  const testCases = [
    {
      name: "有效邮箱验证",
      input: "验证邮箱地址 user@example.com 是否有效",
    },
    {
      name: "无效邮箱验证",
      input: "验证邮箱地址 invalid-email 是否有效",
    },
    {
      name: "快速操作",
      input: "执行一个需要 2 秒的慢操作",
    },
    {
      name: "超时操作",
      input: "执行一个需要 10 秒的慢操作",
    },
    {
      name: "权限不足",
      input: "以 user 角色执行受限操作",
    },
    {
      name: "不稳定 API（会重试）",
      input: "调用不稳定的 API，输入 'test data'",
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n🧪 测试: ${testCase.name}`);
    console.log(`📝 输入: ${testCase.input}`);
    console.log("-".repeat(50));

    try {
      const result = await agentExecutor.invoke({
        input: testCase.input,
      });

      console.log(`\n✅ 结果: ${result.output}\n`);
    } catch (error) {
      console.log(`\n❌ 捕获错误: ${error.message}\n`);
    }

    console.log("=".repeat(50));
  }

  // 5. 总结
  console.log("\n📚 错误处理要点:");
  console.log("-".repeat(50));
  console.log("1. 在工具中使用 try-catch 处理异常");
  console.log("2. 返回清晰的错误消息而不是抛出异常");
  console.log("3. 设置合理的 maxIterations 防止无限循环");
  console.log("4. 启用 handleParsingErrors 处理解析错误");
  console.log("5. 验证输入参数的有效性");
  console.log("6. 考虑超时和重试机制");
}

main().catch(console.error);
