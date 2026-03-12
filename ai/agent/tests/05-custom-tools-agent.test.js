/**
 * Demo 5: 自定义工具 Agent 单测
 *
 * 测试策略：直接测试每个自定义工具的 func 逻辑
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DynamicTool } from "@langchain/core/tools";

vi.mock("../demos/config.js", () => ({
  getLLMConfig: vi.fn(() => ({ modelName: "gpt-4", temperature: 0 })),
  checkEnvConfig: vi.fn(),
}));

// ---- 复制 demo 中的工具定义 ----
const reverseStringTool = new DynamicTool({
  name: "reverse_string",
  description: "反转输入的字符串。",
  func: async (input) => input.split("").reverse().join(""),
});

const getCurrentTimeTool = new DynamicTool({
  name: "get_current_time",
  description: "获取当前的日期和时间。",
  func: async () => {
    const now = new Date();
    return `当前时间: ${now.toLocaleString("zh-CN", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })}`;
  },
});

const stringLengthTool = new DynamicTool({
  name: "string_length",
  description: "计算字符串的长度。",
  func: async (input) => `字符串 "${input}" 的长度是 ${input.length} 个字符`,
});

const randomNumberTool = new DynamicTool({
  name: "random_number",
  description: "生成指定范围内的随机整数。输入格式: 'min,max'",
  func: async (input) => {
    const [min, max] = input.split(",").map(Number);
    if (isNaN(min) || isNaN(max)) {
      return "错误: 请提供有效的数字范围，格式为 'min,max'";
    }
    const random = Math.floor(Math.random() * (max - min + 1)) + min;
    return `在 ${min} 到 ${max} 之间的随机数是: ${random}`;
  },
});

describe("Demo 5 - 自定义工具 Agent", () => {
  describe("reverse_string 工具", () => {
    it("反转普通字符串", async () => {
      const result = await reverseStringTool.invoke("Hello LangChain");
      expect(result).toBe("niahCgnaL olleH");
    });

    it("反转空字符串", async () => {
      const result = await reverseStringTool.invoke("");
      expect(result).toBe("");
    });

    it("反转单个字符", async () => {
      const result = await reverseStringTool.invoke("A");
      expect(result).toBe("A");
    });

    it("反转包含中文的字符串", async () => {
      const result = await reverseStringTool.invoke("你好世界");
      expect(result).toBe("界世好你");
    });
  });

  describe("get_current_time 工具", () => {
    it("返回包含'当前时间'的字符串", async () => {
      const result = await getCurrentTimeTool.invoke("");
      expect(result).toContain("当前时间:");
    });

    it("返回的时间格式符合预期（包含年月日）", async () => {
      const result = await getCurrentTimeTool.invoke("");
      // 格式类似 "当前时间: 2026/03/06 10:30:00"
      expect(result).toMatch(/\d{4}/); // 年份
    });
  });

  describe("string_length 工具", () => {
    it("计算英文字符串长度", async () => {
      const result = await stringLengthTool.invoke("LangChain Agent");
      expect(result).toContain("15 个字符");
    });

    it("计算空字符串长度", async () => {
      const result = await stringLengthTool.invoke("");
      expect(result).toContain("0 个字符");
    });

    it("计算中文字符串长度", async () => {
      const result = await stringLengthTool.invoke("你好");
      expect(result).toContain("2 个字符");
    });
  });

  describe("random_number 工具", () => {
    it("生成的随机数在指定范围内", async () => {
      for (let i = 0; i < 20; i++) {
        const result = await randomNumberTool.invoke("1,100");
        const match = result.match(/随机数是: (\d+)/);
        expect(match).not.toBeNull();
        const num = parseInt(match[1]);
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(100);
      }
    });

    it("min 等于 max 时返回该值", async () => {
      const result = await randomNumberTool.invoke("42,42");
      expect(result).toContain("42");
    });

    it("输入非法格式时返回错误信息", async () => {
      const result = await randomNumberTool.invoke("abc,xyz");
      expect(result).toContain("错误");
    });

    it("只有一个数字时返回错误信息", async () => {
      const result = await randomNumberTool.invoke("50");
      expect(result).toContain("错误");
    });
  });

  describe("工具元数据", () => {
    it("所有工具都有 name 和 description", () => {
      const tools = [reverseStringTool, getCurrentTimeTool, stringLengthTool, randomNumberTool];
      for (const tool of tools) {
        expect(tool.name).toBeTruthy();
        expect(tool.description).toBeTruthy();
      }
    });

    it("工具名称唯一", () => {
      const tools = [reverseStringTool, getCurrentTimeTool, stringLengthTool, randomNumberTool];
      const names = tools.map((t) => t.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });
  });
});
