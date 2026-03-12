/**
 * config.js 单测
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("config.js - getLLMConfig", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("默认返回 gpt-4 和 temperature=0", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubEnv("OPENAI_API_BASE", "");
    const { getLLMConfig } = await import("../demos/config.js");
    const config = getLLMConfig();
    expect(config.modelName).toBe("gpt-4");
    expect(config.temperature).toBe(0);
    expect(config.configuration).toBeUndefined();
  });

  it("支持自定义 modelName 和 temperature", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubEnv("OPENAI_API_BASE", "");
    const { getLLMConfig } = await import("../demos/config.js");
    const config = getLLMConfig({ modelName: "gpt-3.5-turbo", temperature: 0.7 });
    expect(config.modelName).toBe("gpt-3.5-turbo");
    expect(config.temperature).toBe(0.7);
  });

  it("配置了 OPENAI_API_BASE 时，configuration.basePath 被设置", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubEnv("OPENAI_API_BASE", "https://custom.api.com/v1");
    const { getLLMConfig } = await import("../demos/config.js");
    const config = getLLMConfig();
    expect(config.configuration).toBeDefined();
    expect(config.configuration.basePath).toBe("https://custom.api.com/v1");
  });

  it("未配置 OPENAI_API_BASE 时，不添加 configuration 字段", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubEnv("OPENAI_API_BASE", "");
    const { getLLMConfig } = await import("../demos/config.js");
    const config = getLLMConfig();
    expect(config.configuration).toBeUndefined();
  });
});

describe("config.js - checkEnvConfig", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("未设置 OPENAI_API_KEY 时调用 process.exit(1)", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {});
    const { checkEnvConfig } = await import("../demos/config.js");
    checkEnvConfig();
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  it("设置了 OPENAI_API_KEY 时正常运行不退出", async () => {
    vi.stubEnv("OPENAI_API_KEY", "sk-test");
    vi.stubEnv("OPENAI_API_BASE", "");
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {});
    const { checkEnvConfig } = await import("../demos/config.js");
    checkEnvConfig();
    expect(exitSpy).not.toHaveBeenCalled();
    exitSpy.mockRestore();
  });
});
