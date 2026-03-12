/**
 * Demo 7: 结构化输出 Agent 单测
 *
 * 测试策略：验证 DynamicStructuredTool 的工具逻辑（数据查询、订单创建）
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

vi.mock("../demos/config.js", () => ({
  getLLMConfig: vi.fn(() => ({ modelName: "gpt-4", temperature: 0 })),
  checkEnvConfig: vi.fn(),
}));

// ---- 复制 demo 中的工具定义 ----
const users = {
  "001": { name: "张三", age: 25, city: "北京", role: "工程师" },
  "002": { name: "李四", age: 30, city: "上海", role: "设计师" },
  "003": { name: "王五", age: 28, city: "深圳", role: "产品经理" },
};

const products = {
  P001: { name: "笔记本电脑", price: 5999, stock: 50, category: "电子产品" },
  P002: { name: "无线鼠标", price: 99, stock: 200, category: "配件" },
  P003: { name: "机械键盘", price: 599, stock: 80, category: "配件" },
};

const getUserInfoTool = new DynamicStructuredTool({
  name: "get_user_info",
  description: "根据用户ID获取用户信息",
  schema: z.object({
    userId: z.string().describe("用户ID"),
  }),
  func: async ({ userId }) => {
    const user = users[userId];
    if (!user) return JSON.stringify({ error: "用户不存在" });
    return JSON.stringify(user);
  },
});

const getProductInfoTool = new DynamicStructuredTool({
  name: "get_product_info",
  description: "根据产品ID获取产品信息",
  schema: z.object({
    productId: z.string().describe("产品ID"),
  }),
  func: async ({ productId }) => {
    const product = products[productId];
    if (!product) return JSON.stringify({ error: "产品不存在" });
    return JSON.stringify(product);
  },
});

const createOrderTool = new DynamicStructuredTool({
  name: "create_order",
  description: "创建新订单",
  schema: z.object({
    userId: z.string().describe("用户ID"),
    productId: z.string().describe("产品ID"),
    quantity: z.number().describe("购买数量"),
  }),
  func: async ({ userId, productId, quantity }) => {
    const orderId = `ORD${Date.now()}`;
    const order = {
      orderId,
      userId,
      productId,
      quantity,
      status: "待支付",
      createdAt: new Date().toISOString(),
    };
    return JSON.stringify({ success: true, order, message: `订单 ${orderId} 创建成功` });
  },
});

describe("Demo 7 - 结构化输出 Agent", () => {
  describe("get_user_info 工具", () => {
    it("查询存在的用户返回正确信息", async () => {
      const result = await getUserInfoTool.invoke({ userId: "001" });
      const user = JSON.parse(result);
      expect(user.name).toBe("张三");
      expect(user.age).toBe(25);
      expect(user.city).toBe("北京");
      expect(user.role).toBe("工程师");
    });

    it("查询不存在的用户返回 error 字段", async () => {
      const result = await getUserInfoTool.invoke({ userId: "999" });
      const parsed = JSON.parse(result);
      expect(parsed.error).toBe("用户不存在");
    });

    it("返回值是合法的 JSON 字符串", async () => {
      const result = await getUserInfoTool.invoke({ userId: "002" });
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it("所有用户 ID 都可以查询", async () => {
      for (const id of ["001", "002", "003"]) {
        const result = await getUserInfoTool.invoke({ userId: id });
        const parsed = JSON.parse(result);
        expect(parsed.name).toBeTruthy();
      }
    });
  });

  describe("get_product_info 工具", () => {
    it("查询存在的产品返回正确信息", async () => {
      const result = await getProductInfoTool.invoke({ productId: "P001" });
      const product = JSON.parse(result);
      expect(product.name).toBe("笔记本电脑");
      expect(product.price).toBe(5999);
      expect(product.stock).toBe(50);
    });

    it("查询不存在的产品返回 error 字段", async () => {
      const result = await getProductInfoTool.invoke({ productId: "P999" });
      const parsed = JSON.parse(result);
      expect(parsed.error).toBe("产品不存在");
    });

    it("返回值是合法的 JSON 字符串", async () => {
      const result = await getProductInfoTool.invoke({ productId: "P002" });
      expect(() => JSON.parse(result)).not.toThrow();
    });
  });

  describe("create_order 工具", () => {
    it("创建订单返回 success:true", async () => {
      const result = await createOrderTool.invoke({
        userId: "002",
        productId: "P002",
        quantity: 3,
      });
      const parsed = JSON.parse(result);
      expect(parsed.success).toBe(true);
    });

    it("创建的订单包含正确的用户和产品信息", async () => {
      const result = await createOrderTool.invoke({
        userId: "001",
        productId: "P001",
        quantity: 1,
      });
      const { order } = JSON.parse(result);
      expect(order.userId).toBe("001");
      expect(order.productId).toBe("P001");
      expect(order.quantity).toBe(1);
    });

    it("创建的订单状态为'待支付'", async () => {
      const result = await createOrderTool.invoke({
        userId: "003",
        productId: "P003",
        quantity: 2,
      });
      const { order } = JSON.parse(result);
      expect(order.status).toBe("待支付");
    });

    it("创建的订单 ID 以 ORD 开头", async () => {
      const result = await createOrderTool.invoke({
        userId: "001",
        productId: "P002",
        quantity: 5,
      });
      const { order } = JSON.parse(result);
      expect(order.orderId).toMatch(/^ORD\d+$/);
    });

    it("创建的订单包含 createdAt 时间戳", async () => {
      const result = await createOrderTool.invoke({
        userId: "002",
        productId: "P003",
        quantity: 1,
      });
      const { order } = JSON.parse(result);
      expect(order.createdAt).toBeTruthy();
      expect(() => new Date(order.createdAt)).not.toThrow();
    });
  });

  describe("工具 Schema 验证", () => {
    it("getUserInfoTool schema 要求 userId 字段", () => {
      const schema = getUserInfoTool.schema;
      expect(() => schema.parse({ userId: "001" })).not.toThrow();
      expect(() => schema.parse({})).toThrow();
    });

    it("getProductInfoTool schema 要求 productId 字段", () => {
      const schema = getProductInfoTool.schema;
      expect(() => schema.parse({ productId: "P001" })).not.toThrow();
      expect(() => schema.parse({})).toThrow();
    });

    it("createOrderTool schema 要求 userId、productId、quantity 字段", () => {
      const schema = createOrderTool.schema;
      expect(() => schema.parse({ userId: "001", productId: "P001", quantity: 1 })).not.toThrow();
      expect(() => schema.parse({ userId: "001", productId: "P001" })).toThrow();
    });

    it("createOrderTool schema 中 quantity 必须是数字", () => {
      const schema = createOrderTool.schema;
      expect(() => schema.parse({ userId: "001", productId: "P001", quantity: "3" })).toThrow();
    });
  });
});
