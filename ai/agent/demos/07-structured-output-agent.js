/**
 * Demo 7: 结构化输出 Agent
 *
 * 这个示例展示如何让 Agent 返回结构化的 JSON 数据
 * 适用于需要程序化处理 Agent 输出的场景
 */

import { ChatOpenAI } from "@langchain/openai";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { z } from "zod";
import { getLLMConfig, checkEnvConfig } from "./config.js";

async function main() {
  // 检查环境配置
  checkEnvConfig();

  console.log("📊 结构化输出 Agent 示例\n");
  console.log("=" .repeat(50));

  // 1. 初始化 LLM
  const model = new ChatOpenAI(getLLMConfig());

  // 2. 定义结构化工具

  // 用户信息查询工具（返回结构化数据）
  const getUserInfoTool = new DynamicStructuredTool({
    name: "get_user_info",
    description: "根据用户ID获取用户信息",
    schema: z.object({
      userId: z.string().describe("用户ID"),
    }),
    func: async ({ userId }) => {
      // 模拟数据库查询
      const users = {
        "001": { name: "张三", age: 25, city: "北京", role: "工程师" },
        "002": { name: "李四", age: 30, city: "上海", role: "设计师" },
        "003": { name: "王五", age: 28, city: "深圳", role: "产品经理" },
      };

      const user = users[userId];
      if (!user) {
        return JSON.stringify({ error: "用户不存在" });
      }

      return JSON.stringify(user);
    },
  });

  // 产品查询工具
  const getProductInfoTool = new DynamicStructuredTool({
    name: "get_product_info",
    description: "根据产品ID获取产品信息",
    schema: z.object({
      productId: z.string().describe("产品ID"),
    }),
    func: async ({ productId }) => {
      const products = {
        "P001": { name: "笔记本电脑", price: 5999, stock: 50, category: "电子产品" },
        "P002": { name: "无线鼠标", price: 99, stock: 200, category: "配件" },
        "P003": { name: "机械键盘", price: 599, stock: 80, category: "配件" },
      };

      const product = products[productId];
      if (!product) {
        return JSON.stringify({ error: "产品不存在" });
      }

      return JSON.stringify(product);
    },
  });

  // 订单创建工具
  const createOrderTool = new DynamicStructuredTool({
    name: "create_order",
    description: "创建新订单",
    schema: z.object({
      userId: z.string().describe("用户ID"),
      productId: z.string().describe("产品ID"),
      quantity: z.number().describe("购买数量"),
    }),
    func: async ({ userId, productId, quantity }) => {
      // 模拟订单创建
      const orderId = `ORD${Date.now()}`;
      const order = {
        orderId,
        userId,
        productId,
        quantity,
        status: "待支付",
        createdAt: new Date().toISOString(),
      };

      return JSON.stringify({
        success: true,
        order,
        message: `订单 ${orderId} 创建成功`,
      });
    },
  });

  const tools = [getUserInfoTool, getProductInfoTool, createOrderTool];

  // 3. 创建 Agent
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
  });

  // 4. 运行示例查询
  const queries = [
    "查询用户ID为 001 的用户信息",
    "查询产品ID为 P001 的产品信息",
    "帮用户 002 创建一个订单，购买产品 P002，数量为 3",
    "查询用户 003 的信息，并推荐适合他的产品",
  ];

  for (const query of queries) {
    console.log(`\n📝 查询: ${query}`);
    console.log("-".repeat(50));

    const result = await agentExecutor.invoke({
      input: query,
    });

    console.log(`\n✅ 结果: ${result.output}\n`);
    console.log("=".repeat(50));
  }

  // 5. 展示工具的结构化定义
  console.log("\n🔧 结构化工具定义:");
  console.log("-".repeat(50));
  tools.forEach((tool) => {
    console.log(`\n工具名称: ${tool.name}`);
    console.log(`描述: ${tool.description}`);
    if (tool.schema) {
      console.log(`参数结构: ${JSON.stringify(tool.schema.shape, null, 2)}`);
    }
  });
}

main().catch(console.error);
