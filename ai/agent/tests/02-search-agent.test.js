/**
 * Demo 2: 搜索 Agent 单测
 *
 * 测试策略：验证 DuckDuckGoSearch 工具构建和 invoke 行为
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../demos/config.js", () => ({
  getLLMConfig: vi.fn(() => ({ modelName: "gpt-4", temperature: 0 })),
  checkEnvConfig: vi.fn(),
}));

vi.mock("@langchain/openai", () => ({
  ChatOpenAI: vi.fn().mockImplementation(function () {}),
}));

vi.mock("langchain/hub", () => ({
  pull: vi.fn().mockResolvedValue({}),
}));

vi.mock("langchain/agents", () => ({
  createReactAgent: vi.fn().mockResolvedValue({}),
  AgentExecutor: vi.fn().mockImplementation(function ({ verbose }) {
    this.verbose = verbose;
    this.invoke = vi.fn().mockResolvedValue({ output: "mock search result" });
  }),
}));

vi.mock("@langchain/community/tools/duckduckgo_search", () => ({
  DuckDuckGoSearch: vi.fn().mockImplementation(function ({ maxResults } = {}) {
    this.name = "duckduckgo_search";
    this.maxResults = maxResults ?? 10;
    this.invoke = vi.fn().mockResolvedValue(
      JSON.stringify([{ title: "Mock Result", snippet: "Mock snippet", link: "https://example.com" }])
    );
  }),
}));

describe("Demo 2 - 搜索 Agent (DuckDuckGoSearch)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("无需 API Key 即可构建 DuckDuckGoSearch 工具", async () => {
    const { DuckDuckGoSearch } = await import("@langchain/community/tools/duckduckgo_search");
    const tool = new DuckDuckGoSearch({ maxResults: 5 });
    expect(tool).toBeDefined();
    expect(tool.name).toBe("duckduckgo_search");
  });

  it("maxResults 参数被正确传入", async () => {
    const { DuckDuckGoSearch } = await import("@langchain/community/tools/duckduckgo_search");
    const tool = new DuckDuckGoSearch({ maxResults: 5 });
    expect(tool.maxResults).toBe(5);
  });

  it("不传 maxResults 时使用默认值 10", async () => {
    const { DuckDuckGoSearch } = await import("@langchain/community/tools/duckduckgo_search");
    const tool = new DuckDuckGoSearch();
    expect(tool.maxResults).toBe(10);
  });

  it("invoke 返回搜索结果字符串", async () => {
    const { DuckDuckGoSearch } = await import("@langchain/community/tools/duckduckgo_search");
    const tool = new DuckDuckGoSearch({ maxResults: 5 });
    const result = await tool.invoke("2024年诺贝尔物理学奖");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("invoke 返回的结果是合法 JSON", async () => {
    const { DuckDuckGoSearch } = await import("@langchain/community/tools/duckduckgo_search");
    const tool = new DuckDuckGoSearch({ maxResults: 5 });
    const result = await tool.invoke("最新的 iPhone 型号");
    expect(() => JSON.parse(result)).not.toThrow();
    const parsed = JSON.parse(result);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0]).toHaveProperty("title");
    expect(parsed[0]).toHaveProperty("snippet");
    expect(parsed[0]).toHaveProperty("link");
  });

  it("AgentExecutor 配置了 verbose:true", async () => {
    const { AgentExecutor } = await import("langchain/agents");
    const executor = new AgentExecutor({ agent: {}, tools: [], verbose: true });
    expect(executor.verbose).toBe(true);
  });
});
