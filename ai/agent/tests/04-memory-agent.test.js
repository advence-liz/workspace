/**
 * Demo 4: 带记忆的 Agent 单测
 *
 * 测试策略：验证 BufferMemory 的存取行为、Prompt 模板变量、以及记忆与 AgentExecutor 的集成
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BufferMemory } from "langchain/memory";
import { PromptTemplate } from "@langchain/core/prompts";

vi.mock("../demos/config.js", () => ({
  getLLMConfig: vi.fn(() => ({ modelName: "gpt-4", temperature: 0 })),
  checkEnvConfig: vi.fn(),
}));

vi.mock("@langchain/openai", () => ({
  ChatOpenAI: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("langchain/agents", () => ({
  createReactAgent: vi.fn().mockResolvedValue({}),
  AgentExecutor: vi.fn().mockImplementation(function ({ memory }) {
    this.memory = memory;
    this.invoke = vi.fn().mockResolvedValue({ output: "300" });
  }),
}));

// Demo 4 使用的 Prompt 模板字符串
const PROMPT_TEMPLATE = `Answer the following questions as best you can. You have access to the following tools:

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
Thought:{agent_scratchpad}`;

describe("Demo 4 - 带记忆的 Agent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Prompt 模板包含所有必要变量", () => {
    const requiredVars = ["tools", "tool_names", "chat_history", "input", "agent_scratchpad"];
    for (const v of requiredVars) {
      expect(PROMPT_TEMPLATE).toContain(`{${v}}`);
    }
  });

  it("PromptTemplate.fromTemplate 可以正确解析变量", async () => {
    const prompt = PromptTemplate.fromTemplate(PROMPT_TEMPLATE);
    expect(prompt.inputVariables).toContain("tools");
    expect(prompt.inputVariables).toContain("tool_names");
    expect(prompt.inputVariables).toContain("chat_history");
    expect(prompt.inputVariables).toContain("input");
    expect(prompt.inputVariables).toContain("agent_scratchpad");
  });

  it("BufferMemory 初始化时 memoryKey 为 chat_history", () => {
    const memory = new BufferMemory({
      memoryKey: "chat_history",
      returnMessages: true,
    });
    expect(memory.memoryKey).toBe("chat_history");
    expect(memory.returnMessages).toBe(true);
  });

  it("BufferMemory 初始时 loadMemoryVariables 返回空历史", async () => {
    const memory = new BufferMemory({
      memoryKey: "chat_history",
      returnMessages: true,
    });
    const vars = await memory.loadMemoryVariables({});
    // 初始为空数组
    expect(vars.chat_history).toBeDefined();
    expect(Array.isArray(vars.chat_history)).toBe(true);
    expect(vars.chat_history.length).toBe(0);
  });

  it("BufferMemory 保存对话后可以读取", async () => {
    const memory = new BufferMemory({
      memoryKey: "chat_history",
      returnMessages: true,
    });
    await memory.saveContext(
      { input: "计算 100 + 200" },
      { output: "300" }
    );
    const vars = await memory.loadMemoryVariables({});
    expect(vars.chat_history.length).toBeGreaterThan(0);
  });

  it("多轮对话后记忆中保存了多条记录", async () => {
    const memory = new BufferMemory({
      memoryKey: "chat_history",
      returnMessages: true,
    });
    await memory.saveContext({ input: "第一轮" }, { output: "回答1" });
    await memory.saveContext({ input: "第二轮" }, { output: "回答2" });
    const vars = await memory.loadMemoryVariables({});
    // 每次 saveContext 存一对 human+ai，共 4 条
    expect(vars.chat_history.length).toBe(4);
  });

  it("AgentExecutor 正确绑定 memory", async () => {
    const { AgentExecutor } = await import("langchain/agents");
    const memory = new BufferMemory({ memoryKey: "chat_history", returnMessages: true });
    const executor = new AgentExecutor({ agent: {}, tools: [], memory });
    expect(executor.memory).toBe(memory);
  });
});
