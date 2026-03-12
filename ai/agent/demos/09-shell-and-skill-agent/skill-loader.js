/**
 * skill-loader.js
 *
 * 模拟 Claude Code 的 Skill 机制，用 LangChain.js 实现：
 *
 * 核心设计：
 *   1. Skill 定义文件是 SKILL.md（frontmatter + markdown 指令）
 *      - frontmatter：name / description / argument-hint / allowed-tools
 *      - markdown 正文：Claude 执行的指令模板，支持 $ARG0 $ARG1 ... $ARGUMENTS 占位符
 *
 *   2. SkillLoader 扫描 skills/ 目录，将每个 SKILL.md 解析为 DynamicTool
 *      - Tool 的 description 来自 frontmatter.description（供 Agent 决策用）
 *      - Tool 的 func 将用户传入的参数替换到模板，然后让 LLM 执行 markdown 指令
 *
 *   3. 调用方式：/skill-name arg0 arg1 ...
 *      - 解析出 skillName 和 args
 *      - 找到对应 Tool，注入参数，交给 AgentExecutor 执行
 *
 * 与 Claude Code 原生 skill 的对应关系：
 *   Claude Code                  本实现
 *   ─────────────────────────────────────────
 *   SKILL.md frontmatter      →  parseFrontmatter()
 *   $ARGUMENTS / $ARG0        →  injectArgs()
 *   allowed-tools             →  toolFilter（过滤可用工具）
 *   /skill-name args          →  parseSkillInvocation()
 *   skill 描述加载到上下文    →  DynamicTool.description
 *   skill 正文发给 Claude     →  DynamicTool.func → LLM.invoke()
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { DynamicTool } from "@langchain/core/tools";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─────────────────────────────────────────────
// Frontmatter 解析
// ─────────────────────────────────────────────

/**
 * 解析 SKILL.md 的 YAML frontmatter
 * 格式：--- key: value --- 包裹的 YAML 块
 *
 * @param {string} content  SKILL.md 的完整文本
 * @returns {{ meta: Object, body: string }}
 */
export function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };

  const meta = {};
  const yamlLines = match[1].split("\n");

  // 简易 YAML 解析（支持 string / list / multiline >）
  let currentKey = null;
  let multilineBuffer = null;

  for (const line of yamlLines) {
    // 多行字符串收集（> 折叠块）
    if (multilineBuffer !== null) {
      if (line.startsWith("  ")) {
        multilineBuffer += " " + line.trim();
        continue;
      } else {
        meta[currentKey] = multilineBuffer.trim();
        multilineBuffer = null;
      }
    }

    const listItem = line.match(/^  - (.+)$/);
    if (listItem && currentKey) {
      if (!Array.isArray(meta[currentKey])) meta[currentKey] = [];
      meta[currentKey].push(listItem[1].trim());
      continue;
    }

    const kv = line.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (kv) {
      currentKey = kv[1];
      const val = kv[2].trim();
      if (val === ">") {
        multilineBuffer = "";
      } else {
        meta[currentKey] = val;
      }
    }
  }
  if (multilineBuffer !== null) meta[currentKey] = multilineBuffer.trim();

  return { meta, body: match[2] };
}

// ─────────────────────────────────────────────
// 参数注入
// ─────────────────────────────────────────────

/**
 * 将用户参数注入到 skill 模板正文
 * 支持：
 *   $ARGUMENTS   → 所有参数拼接（空格分隔）
 *   $ARG0 $ARG1  → 第 N 个参数（对应 Claude Code 的 $0 $1）
 *
 * @param {string} template  SKILL.md 的 body 文本
 * @param {string[]} args    用户传入的参数数组
 * @returns {string}
 */
export function injectArgs(template, args) {
  let result = template;
  result = result.replace(/\$ARGUMENTS/g, args.join(" "));
  args.forEach((arg, i) => {
    result = result.replace(new RegExp(`\\$ARG${i}`, "g"), arg);
  });
  return result;
}

// ─────────────────────────────────────────────
// Skill 调用语法解析
// ─────────────────────────────────────────────

/**
 * 解析 /skill-name arg0 arg1 ... 格式的调用
 * 第一个 token 是 skill 名，其余是参数
 * 最后一个参数允许包含空格（引号包裹或剩余全部内容）
 *
 * 示例：
 *   "/format-code javascript const x=1"
 *   → { skillName: "format-code", args: ["javascript", "const x=1"] }
 *
 * @param {string} input
 * @returns {{ skillName: string, args: string[] } | null}
 */
export function parseSkillInvocation(input) {
  const trimmed = input.trim();
  if (!trimmed.startsWith("/")) return null;

  // 去掉开头的 /
  const rest = trimmed.slice(1);
  const spaceIdx = rest.indexOf(" ");

  if (spaceIdx === -1) {
    return { skillName: rest, args: [] };
  }

  const skillName = rest.slice(0, spaceIdx);
  const argStr = rest.slice(spaceIdx + 1).trim();

  // 简单分割：第一个空格前是 ARG0，其余全部作为 ARG1（代码可能含空格）
  const firstSpace = argStr.indexOf(" ");
  const args =
    firstSpace === -1
      ? [argStr]
      : [argStr.slice(0, firstSpace), argStr.slice(firstSpace + 1)];

  return { skillName, args };
}

// ─────────────────────────────────────────────
// SkillLoader：扫描目录，将 SKILL.md 注册为 DynamicTool
// ─────────────────────────────────────────────

export class SkillLoader {
  /**
   * @param {string} skillsDir  skills/ 目录的绝对路径
   * @param {Object} llmConfig  ChatOpenAI 配置（用于执行 skill 指令）
   * @param {DynamicTool[]} availableTools  Agent 已有的工具（供 skill 内部调用）
   */
  constructor(skillsDir, llmConfig, availableTools = []) {
    this.skillsDir = skillsDir;
    this.llmConfig = llmConfig;
    this.availableTools = availableTools;
    /** @type {Map<string, { meta: Object, body: string, tool: DynamicTool }>} */
    this.registry = new Map();
  }

  /**
   * 扫描 skillsDir，加载所有 SKILL.md
   * 每个子目录对应一个 skill
   */
  load() {
    if (!existsSync(this.skillsDir)) {
      console.warn(`[SkillLoader] skills 目录不存在: ${this.skillsDir}`);
      return this;
    }

    const entries = readdirSync(this.skillsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillMdPath = join(this.skillsDir, entry.name, "SKILL.md");
      if (!existsSync(skillMdPath)) continue;

      try {
        const content = readFileSync(skillMdPath, "utf-8");
        const { meta, body } = parseFrontmatter(content);
        const skillName = meta.name || entry.name;
        const tool = this._buildTool(skillName, meta, body, skillMdPath);
        this.registry.set(skillName, { meta, body, tool });
        console.log(`[SkillLoader] 已加载 skill: /${skillName}  — ${meta.description?.slice(0, 60)}...`);
      } catch (err) {
        console.error(`[SkillLoader] 加载 skill 失败 (${entry.name}): ${err.message}`);
      }
    }

    return this;
  }

  /**
   * 返回所有已注册 skill 的 DynamicTool 列表
   * 可直接传给 AgentExecutor 的 tools 数组
   */
  getTools() {
    return [...this.registry.values()].map((s) => s.tool);
  }

  /**
   * 打印已加载的 skill 列表
   */
  listSkills() {
    console.log("\n📦 已加载的 Skills:");
    console.log("-".repeat(50));
    for (const [name, { meta }] of this.registry) {
      console.log(`  /${name}`);
      console.log(`    描述: ${meta.description?.trim()}`);
      if (meta["argument-hint"]) {
        console.log(`    参数: ${meta["argument-hint"]}`);
      }
      if (meta["allowed-tools"]) {
        const tools = Array.isArray(meta["allowed-tools"])
          ? meta["allowed-tools"].join(", ")
          : meta["allowed-tools"];
        console.log(`    工具: ${tools}`);
      }
    }
    console.log();
  }

  /**
   * 将一个 SKILL.md 构建为 DynamicTool
   *
   * Tool 的 func 逻辑：
   *   1. 解析 input 格式："arg0|||arg1|||..."（由 AgentExecutor 传入）
   *   2. 将参数注入 skill 模板
   *   3. 用 LLM 执行 markdown 指令（skill 正文就是 prompt）
   *   4. 返回 LLM 的回答
   */
  _buildTool(skillName, meta, body, skillMdPath) {
    const loader = this;

    return new DynamicTool({
      name: `skill_${skillName.replace(/-/g, "_")}`,
      // description 供 Agent 在推理时判断是否调用该 skill
      description:
        `[Skill] ${meta.description?.trim() || skillName}` +
        (meta["argument-hint"] ? ` 参数格式：${meta["argument-hint"]}` : "") +
        ` 调用格式：用 ||| 分隔参数，例如 "javascript|||const x=1"`,

      func: async (input) => {
        // 解析参数：支持 "arg0|||arg1" 或单个字符串
        const args = input.includes("|||")
          ? input.split("|||").map((s) => s.trim())
          : [input.trim()];

        // 将参数注入 skill 模板
        const prompt = injectArgs(body, args);

        console.log(`\n[Skill /${skillName}] 执行中...`);
        console.log(`  参数: ${JSON.stringify(args)}`);

        // 用 LLM 执行 skill 的 markdown 指令
        // skill 正文本身就是一段结构化的 prompt
        const llm = new ChatOpenAI(loader.llmConfig);
        const response = await llm.invoke([new HumanMessage(prompt)]);
        return response.content;
      },
    });
  }
}
