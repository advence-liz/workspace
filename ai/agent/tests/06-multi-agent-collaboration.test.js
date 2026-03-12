/**
 * Demo 6: 多 Agent 协作单测
 *
 * 测试策略：验证各专家工具的逻辑，以及协调器通过工具分发任务的机制
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DynamicTool } from "@langchain/core/tools";

vi.mock("../demos/config.js", () => ({
  getLLMConfig: vi.fn(() => ({ modelName: "gpt-4", temperature: 0 })),
  checkEnvConfig: vi.fn(),
}));

vi.mock("@langchain/openai", () => ({
  ChatOpenAI: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("langchain/hub", () => ({
  pull: vi.fn().mockResolvedValue({}),
}));

vi.mock("langchain/agents", () => ({
  createReactAgent: vi.fn().mockResolvedValue({}),
  AgentExecutor: vi.fn().mockImplementation(() => ({
    invoke: vi.fn().mockResolvedValue({ output: "mock result" }),
  })),
}));

// ---- 复制 demo 中的文本工具逻辑 ----
const countWordsTool = new DynamicTool({
  name: "count_words",
  description: "计算文本中的单词数量",
  func: async (text) => {
    const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
    return `文本包含 ${words.length} 个单词`;
  },
});

const toUppercaseTool = new DynamicTool({
  name: "to_uppercase",
  description: "将文本转换为大写",
  func: async (text) => text.toUpperCase(),
});

const extractNumbersTool = new DynamicTool({
  name: "extract_numbers",
  description: "从文本中提取所有数字",
  func: async (text) => {
    const numbers = text.match(/\d+/g) || [];
    return `提取的数字: ${numbers.join(", ")}`;
  },
});

describe("Demo 6 - 多 Agent 协作", () => {
  describe("count_words 工具", () => {
    it("计算英文单词数量", async () => {
      const result = await countWordsTool.invoke("Hello World 123 456");
      expect(result).toContain("4 个单词");
    });

    it("处理多余空格", async () => {
      const result = await countWordsTool.invoke("  hello   world  ");
      expect(result).toContain("2 个单词");
    });

    it("空字符串返回 0 个单词", async () => {
      const result = await countWordsTool.invoke("");
      expect(result).toContain("0 个单词");
    });
  });

  describe("to_uppercase 工具", () => {
    it("将文本转换为大写", async () => {
      const result = await toUppercaseTool.invoke("hello langchain");
      expect(result).toBe("HELLO LANGCHAIN");
    });

    it("已经是大写的文本保持不变", async () => {
      const result = await toUppercaseTool.invoke("HELLO");
      expect(result).toBe("HELLO");
    });

    it("数字和符号保持不变", async () => {
      const result = await toUppercaseTool.invoke("abc 123 !@#");
      expect(result).toBe("ABC 123 !@#");
    });
  });

  describe("extract_numbers 工具", () => {
    it("从文本中提取数字", async () => {
      const result = await extractNumbersTool.invoke("Hello World 123 456");
      expect(result).toContain("123");
      expect(result).toContain("456");
    });

    it("文本中没有数字时返回空", async () => {
      const result = await extractNumbersTool.invoke("Hello World");
      expect(result).toBe("提取的数字: ");
    });

    it("提取多个数字", async () => {
      const result = await extractNumbersTool.invoke("a1 b22 c333");
      expect(result).toContain("1");
      expect(result).toContain("22");
      expect(result).toContain("333");
    });
  });

  describe("协调器工具封装", () => {
    it("math_expert 工具调用子 Agent 并返回结果", async () => {
      const mockMathAgent = {
        invoke: vi.fn().mockResolvedValue({ output: "56088" }),
      };
      const mathExpertTool = new DynamicTool({
        name: "math_expert",
        description: "数学专家",
        func: async (input) => {
          const result = await mockMathAgent.invoke({ input });
          return result.output;
        },
      });

      const result = await mathExpertTool.invoke("123 * 456");
      expect(mockMathAgent.invoke).toHaveBeenCalledWith({ input: "123 * 456" });
      expect(result).toBe("56088");
    });

    it("text_expert 工具调用子 Agent 并返回结果", async () => {
      const mockTextAgent = {
        invoke: vi.fn().mockResolvedValue({ output: "文本包含 3 个单词" }),
      };
      const textExpertTool = new DynamicTool({
        name: "text_expert",
        description: "文本处理专家",
        func: async (input) => {
          const result = await mockTextAgent.invoke({ input });
          return result.output;
        },
      });

      const result = await textExpertTool.invoke("计算单词数量");
      expect(mockTextAgent.invoke).toHaveBeenCalledWith({ input: "计算单词数量" });
      expect(result).toBe("文本包含 3 个单词");
    });
  });
});
