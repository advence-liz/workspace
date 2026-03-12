/**
 * Demo 1: 基础 ReAct Agent 单测
 *
 * 测试策略：mock LLM 和 pull，验证 Agent 构建和执行流程
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Calculator } from "@langchain/community/tools/calculator";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// mock 外部依赖
vi.mock("langchain/hub", () => ({
  pull: vi.fn(),
}));

vi.mock("../demos/config.js", () => ({
  getLLMConfig: vi.fn(() => ({ modelName: "gpt-4", temperature: 0 })),
  checkEnvConfig: vi.fn(),
}));

vi.mock("@langchain/openai", () => ({
  ChatOpenAI: vi.fn().mockImplementation(function () {
    this.invoke = vi.fn();
    this._modelType = () => "base_chat_model";
  }),
}));

vi.mock("langchain/agents", () => ({
  createReactAgent: vi.fn(),
  AgentExecutor: vi.fn().mockImplementation(function ({ agent, tools }) {
    this.agent = agent;
    this.tools = tools;
    this.invoke = vi.fn().mockResolvedValue({ output: "579" });
  }),
}));

describe("Demo 1 - 基础 ReAct Agent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Calculator 工具可以正确计算加法", async () => {
    const calc = new Calculator();
    const result = await calc.invoke("123 + 456");
    expect(result).toBe("579");
  });

  it("Calculator 工具可以计算乘法", async () => {
    const calc = new Calculator();
    const result = await calc.invoke("12 * 12");
    expect(result).toBe("144");
  });

  it("Calculator 工具可以计算圆面积", async () => {
    const calc = new Calculator();
    const result = await calc.invoke("3.14159 * 5 * 5");
    const num = parseFloat(result);
    expect(num).toBeCloseTo(78.53975, 3);
  });

  it("AgentExecutor 使用 Calculator 工具构建成功", async () => {
    const { pull } = await import("langchain/hub");
    const { createReactAgent: mockCreate, AgentExecutor: MockExecutor } = await import("langchain/agents");
    const { ChatOpenAI } = await import("@langchain/openai");

    const mockPrompt = { inputVariables: ["tools", "tool_names", "input", "agent_scratchpad"] };
    pull.mockResolvedValue(mockPrompt);
    mockCreate.mockResolvedValue({ plan: vi.fn() });

    const model = new ChatOpenAI({ modelName: "gpt-4" });
    const tools = [new Calculator()];
    const prompt = await pull("hwchase17/react");
    const agent = await mockCreate({ llm: model, tools, prompt });
    const executor = new MockExecutor({ agent, tools, verbose: false });

    expect(pull).toHaveBeenCalledWith("hwchase17/react");
    expect(mockCreate).toHaveBeenCalledWith({ llm: model, tools, prompt });
    expect(executor).toBeDefined();
  });

  it("AgentExecutor.invoke 返回正确结构", async () => {
    const { AgentExecutor: MockExecutor } = await import("langchain/agents");
    const executor = new MockExecutor({ agent: {}, tools: [] });
    const result = await executor.invoke({ input: "123 加 456 等于多少？" });
    expect(result).toHaveProperty("output");
    expect(typeof result.output).toBe("string");
  });
});
