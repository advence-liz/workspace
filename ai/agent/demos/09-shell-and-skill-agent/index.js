/**
 * Demo 9: Shell 工具 + 自定义 Skill Agent
 *
 * 演示如何用 LangChain.js 实现类似 Claude Code 的 Skill 机制：
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │  Claude Code Skill 模式                                  │
 * │                                                          │
 * │  skills/format-code/SKILL.md  ← markdown + frontmatter  │
 * │         ↓ SkillLoader 解析                               │
 * │  DynamicTool（description 来自 frontmatter）             │
 * │         ↓ 注册到 AgentExecutor                           │
 * │  Agent 按需调用 → 参数注入模板 → LLM 执行 markdown 指令  │
 * └─────────────────────────────────────────────────────────┘
 *
 * 目录结构：
 *   index.js          — Agent 主逻辑（本文件）
 *   tools.js          — Shell 工具（原子操作）
 *   skill-loader.js   — Skill 机制：解析 SKILL.md → DynamicTool
 *   skills/
 *     format-code/
 *       SKILL.md      — 代码格式化 skill（纯 markdown，无 JS 逻辑）
 */

import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { getLLMConfig, checkEnvConfig } from "../config.js";
import { runShellCommandTool, listFilesTool, readFileTool } from "./tools.js";
import { SkillLoader, parseSkillInvocation } from "./skill-loader.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  checkEnvConfig();

  console.log("🛠️  Shell 工具 + Skill Agent 示例\n");
  console.log("=".repeat(50));

  // 1. 基础工具（原子能力）
  const shellTools = [runShellCommandTool, listFilesTool, readFileTool];

  // 2. 加载 skills/ 目录下的所有 SKILL.md，转为 DynamicTool
  const skillsDir = join(__dirname, "skills");
  const skillLoader = new SkillLoader(skillsDir, getLLMConfig(), shellTools);
  skillLoader.load();
  skillLoader.listSkills();

  const skillTools = skillLoader.getTools();

  // 3. 合并工具：Shell 工具 + Skill 工具
  const tools = [...shellTools, ...skillTools];

  // 4. 创建 Agent
  const model = new ChatOpenAI(getLLMConfig());
  const prompt = await pull("hwchase17/react");
  const agent = await createReactAgent({ llm: model, tools, prompt });
  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    verbose: true,
    maxIterations: 8,
    handleParsingErrors: true,
  });

  // 5. 演示任务
  const tasks = [
    // Shell 工具直接调用
    "执行 shell 命令 'echo Hello from Shell Tool' 并告诉我输出",
    "列出当前目录 '.' 下有哪些文件",

    // Skill 调用（/format-code 语法）
    // Agent 会识别出需要调用 skill_format_code 工具，传入参数
    "/format-code javascript|||const   x=1;const y=2;\nfunction add(a,b){return a+b;}\nconsole.log(add(x,y))",
    '/format-code json|||{"name":"Alice","age":30,"skills":["js","ts"]}',
  ];

  for (const task of tasks) {
    // 检测 /skill-name 调用语法，转换为 Agent 可理解的自然语言
    const invocation = parseSkillInvocation(task);
    const input = invocation
      ? `请使用 skill_${invocation.skillName.replace(/-/g, "_")} 工具，` +
        `参数为 "${invocation.args.join("|||")}"`
      : task;

    console.log(`\n📋 任务: ${task.slice(0, 80)}${task.length > 80 ? "..." : ""}`);
    console.log("-".repeat(50));

    try {
      const result = await agentExecutor.invoke({ input });
      console.log(`\n✅ 结果: ${result.output}\n`);
    } catch (err) {
      console.log(`\n❌ 错误: ${err.message}\n`);
    }

    console.log("=".repeat(50));
  }

  // 6. 概念说明
  console.log("\n📚 Skill 机制说明:");
  console.log("-".repeat(50));
  console.log("SKILL.md      — skill 的定义文件（markdown + frontmatter）");
  console.log("  frontmatter — name / description / argument-hint / allowed-tools");
  console.log("  body        — markdown 指令模板，支持 $ARG0 $ARG1 $ARGUMENTS 占位符");
  console.log();
  console.log("SkillLoader   — 扫描 skills/ 目录，将每个 SKILL.md 解析为 DynamicTool");
  console.log("  description → frontmatter.description（供 Agent 决策）");
  console.log("  func        → 注入参数 + 用 LLM 执行 markdown 指令");
  console.log();
  console.log("调用方式      — /skill-name arg0 arg1  或直接让 Agent 自主决策");
}

main().catch(console.error);
