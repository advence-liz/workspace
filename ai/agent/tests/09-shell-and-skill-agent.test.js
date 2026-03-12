/**
 * Demo 9: Shell 工具 + 自定义 Skill Agent 单测
 *
 * 分别测试 tools.js 和 skills.js 中导出的逻辑
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DynamicTool, DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";

vi.mock("child_process", () => ({ execSync: vi.fn() }));
vi.mock("fs", () => ({ existsSync: vi.fn(), readFileSync: vi.fn() }));

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
  AgentExecutor: vi.fn().mockImplementation(function ({ maxIterations, handleParsingErrors }) {
    this.maxIterations = maxIterations;
    this.handleParsingErrors = handleParsingErrors;
    this.invoke = vi.fn().mockResolvedValue({ output: "mock result" });
  }),
}));

// ── 从拆分后的模块导入 ──────────────────────────────────────
// 注意：vi.mock 必须在 import 之前声明，这里通过动态 import 在测试中加载

async function loadTools() {
  return import("../demos/09-shell-and-skill-agent/tools.js");
}

async function loadSkills() {
  return import("../demos/09-shell-and-skill-agent/skills.js");
}

// ─────────────────────────────────────────────────────────
// tools.js 测试
// ─────────────────────────────────────────────────────────

describe("Demo 9 - tools.js", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("run_shell_command 工具", () => {
    it("正常执行命令并返回 stdout", async () => {
      execSync.mockReturnValue("hello world\n");
      const { runShellCommandTool } = await loadTools();
      const result = await runShellCommandTool.invoke("echo hello world");
      expect(result).toBe("hello world");
    });

    it("命令无输出时返回提示文字", async () => {
      execSync.mockReturnValue("   ");
      const { runShellCommandTool } = await loadTools();
      const result = await runShellCommandTool.invoke("true");
      expect(result).toBe("(命令执行成功，无输出)");
    });

    it("拦截 rm 命令，不调用 execSync", async () => {
      const { runShellCommandTool } = await loadTools();
      const result = await runShellCommandTool.invoke("rm -rf /tmp/test");
      expect(result).toContain("危险操作");
      expect(result).toContain("已被拒绝执行");
      expect(execSync).not.toHaveBeenCalled();
    });

    it("拦截 kill 命令", async () => {
      const { runShellCommandTool } = await loadTools();
      const result = await runShellCommandTool.invoke("kill -9 1234");
      expect(result).toContain("危险操作");
    });

    it("拦截 shutdown 命令", async () => {
      const { runShellCommandTool } = await loadTools();
      const result = await runShellCommandTool.invoke("shutdown now");
      expect(result).toContain("危险操作");
    });

    it("命令执行失败时返回错误信息", async () => {
      execSync.mockImplementation(() => { throw new Error("command not found"); });
      const { runShellCommandTool } = await loadTools();
      const result = await runShellCommandTool.invoke("nonexistent_cmd");
      expect(result).toContain("执行失败");
      expect(result).toContain("command not found");
    });

    it("安全命令（pwd）正常执行", async () => {
      execSync.mockReturnValue("/home/user\n");
      const { runShellCommandTool } = await loadTools();
      const result = await runShellCommandTool.invoke("pwd");
      expect(execSync).toHaveBeenCalled();
      expect(result).toBe("/home/user");
    });

    it("是 DynamicTool 实例", async () => {
      const { runShellCommandTool } = await loadTools();
      expect(runShellCommandTool).toBeInstanceOf(DynamicTool);
    });
  });

  describe("list_files 工具", () => {
    it("返回目录文件列表", async () => {
      execSync.mockReturnValue("file1.js\nfile2.js\n");
      const { listFilesTool } = await loadTools();
      const result = await listFilesTool.invoke("./demos");
      expect(result).toContain("file1.js");
      expect(result).toContain("file2.js");
    });

    it("空目录返回提示", async () => {
      execSync.mockReturnValue("  ");
      const { listFilesTool } = await loadTools();
      const result = await listFilesTool.invoke("./empty");
      expect(result).toBe("(目录为空)");
    });

    it("目录不存在时返回错误信息", async () => {
      execSync.mockImplementation(() => { throw new Error("No such file or directory"); });
      const { listFilesTool } = await loadTools();
      const result = await listFilesTool.invoke("./nonexistent");
      expect(result).toContain("错误");
      expect(result).toContain("nonexistent");
    });

    it("是 DynamicTool 实例", async () => {
      const { listFilesTool } = await loadTools();
      expect(listFilesTool).toBeInstanceOf(DynamicTool);
    });
  });

  describe("read_file 工具", () => {
    it("文件不存在时返回错误", async () => {
      existsSync.mockReturnValue(false);
      const { readFileTool } = await loadTools();
      const result = await readFileTool.invoke("./missing.js");
      expect(result).toContain("错误");
      expect(result).toContain("不存在");
    });

    it("正常读取文件内容", async () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue("const x = 1;\n");
      const { readFileTool } = await loadTools();
      const result = await readFileTool.invoke("./demo.js");
      expect(result).toBe("const x = 1;\n");
    });

    it("超过 5000 字符时截断并提示", async () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue("a".repeat(6000));
      const { readFileTool } = await loadTools();
      const result = await readFileTool.invoke("./big.js");
      expect(result.length).toBeLessThan(6000);
      expect(result).toContain("内容已截断");
      expect(result).toContain("6000 字符");
    });

    it("文件读取异常时返回错误信息", async () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockImplementation(() => { throw new Error("permission denied"); });
      const { readFileTool } = await loadTools();
      const result = await readFileTool.invoke("./protected.js");
      expect(result).toContain("错误");
      expect(result).toContain("permission denied");
    });

    it("是 DynamicTool 实例", async () => {
      const { readFileTool } = await loadTools();
      expect(readFileTool).toBeInstanceOf(DynamicTool);
    });
  });
});

// ─────────────────────────────────────────────────────────
// skills.js 测试
// ─────────────────────────────────────────────────────────

describe("Demo 9 - skills.js", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("basicFormat 工具函数", () => {
    it("JSON 格式化：美化压缩的 JSON", async () => {
      const { basicFormat } = await loadSkills();
      const result = basicFormat('{"name":"Alice","age":30}', "json");
      const parsed = JSON.parse(result);
      expect(parsed.name).toBe("Alice");
      expect(result).toContain("\n");
    });

    it("JSON 格式化：非法 JSON 原样返回", async () => {
      const { basicFormat } = await loadSkills();
      const raw = "{invalid json}";
      expect(basicFormat(raw, "json")).toBe(raw);
    });

    it("JavaScript：替换 tab 为 2 空格", async () => {
      const { basicFormat } = await loadSkills();
      const result = basicFormat("function foo() {\n\treturn 1;\n}", "javascript");
      expect(result).not.toContain("\t");
      expect(result).toContain("  return 1;");
    });

    it("去除行尾空白", async () => {
      const { basicFormat } = await loadSkills();
      const result = basicFormat("const x = 1;   \nconst y = 2;  ", "javascript");
      result.split("\n").forEach((line) => {
        expect(line).toBe(line.trimEnd());
      });
    });
  });

  describe("formatCodeSkill Skill", () => {
    describe("prettier 不可用时降级", () => {
      beforeEach(() => {
        execSync.mockImplementation((cmd) => {
          if (cmd.includes("prettier --version")) throw new Error("not found");
          throw new Error("unexpected call");
        });
      });

      it("JSON 格式化返回正确结构", async () => {
        const { formatCodeSkill } = await loadSkills();
        const result = await formatCodeSkill.invoke({ code: '{"a":1}', language: "json" });
        const parsed = JSON.parse(result);
        expect(parsed.language).toBe("json");
        expect(parsed.method).toContain("fallback");
        expect(parsed.formatted).toContain("\n");
      });

      it("返回行数统计", async () => {
        const { formatCodeSkill } = await loadSkills();
        const result = await formatCodeSkill.invoke({ code: "line1\nline2\nline3", language: "javascript" });
        const parsed = JSON.parse(result);
        expect(parsed.originalLines).toBe(3);
        expect(parsed.formattedLines).toBeGreaterThan(0);
      });

      it("返回值是合法 JSON 字符串", async () => {
        const { formatCodeSkill } = await loadSkills();
        const result = await formatCodeSkill.invoke({ code: "const x=1", language: "javascript" });
        expect(() => JSON.parse(result)).not.toThrow();
      });
    });

    describe("prettier 可用时", () => {
      beforeEach(() => {
        execSync.mockImplementation((cmd, opts) => {
          if (cmd.includes("prettier --version")) return "3.0.0";
          if (cmd.includes("prettier --parser")) return opts?.input ? opts.input.trim() + "\n" : "";
          return "";
        });
      });

      it("method 标注为 prettier", async () => {
        const { formatCodeSkill } = await loadSkills();
        const result = await formatCodeSkill.invoke({ code: "const x=1", language: "javascript" });
        const parsed = JSON.parse(result);
        expect(parsed.method).toBe("prettier");
      });

      it("prettier 执行失败时降级并记录 warning", async () => {
        execSync.mockImplementation((cmd) => {
          if (cmd.includes("prettier --version")) return "3.0.0";
          if (cmd.includes("prettier --parser")) throw new Error("parse error");
          return "";
        });
        const { formatCodeSkill } = await loadSkills();
        const result = await formatCodeSkill.invoke({ code: "const x=1", language: "javascript" });
        const parsed = JSON.parse(result);
        expect(parsed.method).toBe("fallback");
        expect(parsed.warning).toContain("降级");
      });
    });

    describe("Schema 验证", () => {
      it("language 必须是枚举值", async () => {
        const { formatCodeSkill } = await loadSkills();
        expect(() => formatCodeSkill.schema.parse({ code: "x", language: "python" })).toThrow();
      });

      it("code 和 language 是必填字段", async () => {
        const { formatCodeSkill } = await loadSkills();
        expect(() => formatCodeSkill.schema.parse({ code: "x" })).toThrow();
        expect(() => formatCodeSkill.schema.parse({ language: "json" })).toThrow();
      });

      it("printWidth 是可选字段", async () => {
        const { formatCodeSkill } = await loadSkills();
        expect(() => formatCodeSkill.schema.parse({ code: "x", language: "json" })).not.toThrow();
        expect(() => formatCodeSkill.schema.parse({ code: "x", language: "json", printWidth: 120 })).not.toThrow();
      });

      it("支持全部 6 种语言类型", async () => {
        const { formatCodeSkill } = await loadSkills();
        for (const lang of ["javascript", "typescript", "json", "css", "html", "markdown"]) {
          expect(() => formatCodeSkill.schema.parse({ code: "x", language: lang })).not.toThrow();
        }
      });

      it("是 DynamicStructuredTool 实例", async () => {
        const { formatCodeSkill } = await loadSkills();
        expect(formatCodeSkill).toBeInstanceOf(DynamicStructuredTool);
      });
    });
  });
});
