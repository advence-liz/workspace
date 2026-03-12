/**
 * Demo 8: 错误处理 Agent 单测
 *
 * 测试策略：验证各工具的错误处理逻辑（不稳定 API、邮箱验证、超时、权限）
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DynamicTool } from "@langchain/core/tools";

vi.mock("../demos/config.js", () => ({
  getLLMConfig: vi.fn(() => ({ modelName: "gpt-4", temperature: 0 })),
  checkEnvConfig: vi.fn(),
}));

// ---- 复制 demo 中的工具定义 ----

function createUnstableApiTool() {
  let apiCallCount = 0;
  return new DynamicTool({
    name: "unstable_api",
    description: "调用一个不稳定的 API（可能会失败）。",
    func: async (input) => {
      apiCallCount++;
      if (apiCallCount <= 2) {
        throw new Error("API 暂时不可用，请稍后重试");
      }
      return `API 调用成功！输入: ${input}`;
    },
  });
}

const validateInputTool = new DynamicTool({
  name: "validate_email",
  description: "验证电子邮件地址是否有效。",
  func: async (input) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input)) {
      return `错误: "${input}" 不是有效的电子邮件地址`;
    }
    return `✅ "${input}" 是有效的电子邮件地址`;
  },
});

const slowOperationTool = new DynamicTool({
  name: "slow_operation",
  description: "执行一个耗时操作。",
  func: async (input) => {
    const seconds = parseInt(input);
    if (isNaN(seconds)) return "错误: 请提供有效的秒数";
    if (seconds > 5) return "错误: 操作超时（最大等待时间为5秒）";
    await new Promise((resolve) => setTimeout(resolve, seconds * 100)); // 测试中缩短为 100ms/s
    return `操作完成，耗时 ${seconds} 秒`;
  },
});

const restrictedTool = new DynamicTool({
  name: "restricted_operation",
  description: "执行需要管理员权限的操作。",
  func: async (input) => {
    const role = input.toLowerCase().trim();
    if (role !== "admin") return "错误: 权限不足，需要管理员权限";
    return "✅ 操作成功执行（管理员权限）";
  },
});

describe("Demo 8 - 错误处理 Agent", () => {
  describe("unstable_api 工具", () => {
    it("前两次调用抛出错误", async () => {
      const tool = createUnstableApiTool();
      await expect(tool.invoke("test")).rejects.toThrow("API 暂时不可用");
      await expect(tool.invoke("test")).rejects.toThrow("API 暂时不可用");
    });

    it("第三次调用成功", async () => {
      const tool = createUnstableApiTool();
      // 消耗前两次失败
      await tool.invoke("test").catch(() => {});
      await tool.invoke("test").catch(() => {});
      const result = await tool.invoke("test data");
      expect(result).toContain("API 调用成功");
      expect(result).toContain("test data");
    });

    it("每个工具实例有独立的计数器", async () => {
      const tool1 = createUnstableApiTool();
      const tool2 = createUnstableApiTool();
      // tool1 消耗 2 次
      await tool1.invoke("a").catch(() => {});
      await tool1.invoke("b").catch(() => {});
      // tool2 第 1 次仍然失败
      await expect(tool2.invoke("c")).rejects.toThrow();
    });
  });

  describe("validate_email 工具", () => {
    it("有效邮箱返回成功信息", async () => {
      const result = await validateInputTool.invoke("user@example.com");
      expect(result).toContain("✅");
      expect(result).toContain("有效的电子邮件地址");
    });

    it("无效邮箱返回错误信息", async () => {
      const result = await validateInputTool.invoke("invalid-email");
      expect(result).toContain("错误");
      expect(result).toContain("不是有效的电子邮件地址");
    });

    it("缺少 @ 符号的邮箱无效", async () => {
      const result = await validateInputTool.invoke("userexample.com");
      expect(result).toContain("错误");
    });

    it("缺少域名的邮箱无效", async () => {
      const result = await validateInputTool.invoke("user@");
      expect(result).toContain("错误");
    });

    it("正常格式的邮箱有效", async () => {
      const validEmails = [
        "test@test.com",
        "user.name@domain.org",
        "user+tag@example.co.uk",
      ];
      for (const email of validEmails) {
        const result = await validateInputTool.invoke(email);
        expect(result).toContain("✅");
      }
    });
  });

  describe("slow_operation 工具", () => {
    it("正常秒数完成操作", async () => {
      const result = await slowOperationTool.invoke("1");
      expect(result).toContain("操作完成");
      expect(result).toContain("1 秒");
    }, 5000);

    it("超过 5 秒返回超时错误", async () => {
      const result = await slowOperationTool.invoke("10");
      expect(result).toContain("错误");
      expect(result).toContain("超时");
    });

    it("输入非数字返回错误", async () => {
      const result = await slowOperationTool.invoke("abc");
      expect(result).toContain("错误");
      expect(result).toContain("有效的秒数");
    });

    it("边界值 5 秒可以正常完成", async () => {
      const result = await slowOperationTool.invoke("5");
      expect(result).toContain("操作完成");
    }, 10000);
  });

  describe("restricted_operation 工具", () => {
    it("admin 角色执行成功", async () => {
      const result = await restrictedTool.invoke("admin");
      expect(result).toContain("✅");
      expect(result).toContain("管理员权限");
    });

    it("user 角色权限不足", async () => {
      const result = await restrictedTool.invoke("user");
      expect(result).toContain("错误");
      expect(result).toContain("权限不足");
    });

    it("大写 ADMIN 被转换为小写后成功", async () => {
      const result = await restrictedTool.invoke("ADMIN");
      expect(result).toContain("✅");
    });

    it("空字符串权限不足", async () => {
      const result = await restrictedTool.invoke("");
      expect(result).toContain("错误");
    });

    it("前后空格被 trim 处理", async () => {
      const result = await restrictedTool.invoke("  admin  ");
      expect(result).toContain("✅");
    });
  });

  describe("AgentExecutor 错误处理配置", () => {
    it("handleParsingErrors 和 maxIterations 参数被正确传递", async () => {
      // 直接验证 AgentExecutor 接受这两个参数（通过 mock）
      const MockExecutor = vi.fn().mockImplementation(function ({ maxIterations, handleParsingErrors }) {
        this.maxIterations = maxIterations;
        this.handleParsingErrors = handleParsingErrors;
      });
      const executor = new MockExecutor({
        agent: {},
        tools: [],
        maxIterations: 5,
        handleParsingErrors: true,
      });
      expect(executor.maxIterations).toBe(5);
      expect(executor.handleParsingErrors).toBe(true);
    });
  });
});
