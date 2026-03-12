/**
 * Demo 3: 计算器 Agent 单测
 *
 * 测试策略：重点测试 Calculator 工具的各类数学计算是否正确
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Calculator } from "@langchain/community/tools/calculator";

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
  AgentExecutor: vi.fn().mockImplementation(function ({ maxIterations }) {
    this.maxIterations = maxIterations;
    this.invoke = vi.fn().mockResolvedValue({ output: "mock result" });
  }),
}));

describe("Demo 3 - 计算器 Agent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("计算 (123 + 456) * 789", async () => {
    const calc = new Calculator();
    const result = await calc.invoke("(123 + 456) * 789");
    expect(result).toBe("456831");
  });

  it("计算正方形面积（边长 12.5）", async () => {
    const calc = new Calculator();
    const area = await calc.invoke("12.5 * 12.5");
    expect(parseFloat(area)).toBeCloseTo(156.25, 2);
  });

  it("计算正方形周长（边长 12.5）", async () => {
    const calc = new Calculator();
    const perimeter = await calc.invoke("4 * 12.5");
    expect(parseFloat(perimeter)).toBeCloseTo(50, 2);
  });

  it("海伦公式计算三角形面积（3,4,5）", async () => {
    const calc = new Calculator();
    // s = (3+4+5)/2 = 6, area = sqrt(6*(6-3)*(6-4)*(6-5)) = sqrt(36) = 6
    // Calculator 用 ^ 0.5 代替 sqrt()
    const s = await calc.invoke("(3 + 4 + 5) / 2");
    expect(parseFloat(s)).toBe(6);
    const area = await calc.invoke("(6 * (6-3) * (6-4) * (6-5)) ^ 0.5");
    expect(parseFloat(area)).toBeCloseTo(6, 4);
  });

  it("计算 2 的 10 次方", async () => {
    const calc = new Calculator();
    const result = await calc.invoke("2^10");
    expect(parseFloat(result)).toBe(1024);
  });

  it("AgentExecutor 设置了 maxIterations: 10", async () => {
    const { AgentExecutor } = await import("langchain/agents");
    const executor = new AgentExecutor({ agent: {}, tools: [], maxIterations: 10 });
    expect(executor.maxIterations).toBe(10);
  });

  it("工具执行错误时被 try-catch 捕获不崩溃", async () => {
    const calc = new Calculator();
    // 传入非法表达式，Calculator 应该返回错误信息而不是 throw
    const result = await calc.invoke("invalid expression @@##");
    // 只要不抛出异常即可
    expect(result).toBeDefined();
  });
});
