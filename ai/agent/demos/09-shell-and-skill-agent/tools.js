/**
 * Shell 工具定义
 *
 * 工具（Tool）= Agent 在推理循环中可直接调用的原子能力
 * 每个工具只做一件事，输入输出均为字符串
 */

import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { DynamicTool } from "@langchain/core/tools";

/** 危险命令黑名单 */
const BLOCKED_COMMANDS = /\b(rm|dd|mkfs|shutdown|reboot|kill|pkill|chmod 777)\b/;

/**
 * 工具1: 执行 shell 命令
 * 安全起见，禁止执行黑名单中的危险命令
 */
export const runShellCommandTool = new DynamicTool({
  name: "run_shell_command",
  description:
    "在本地执行一条 shell 命令并返回输出结果。" +
    "输入应该是一条完整的 shell 命令，例如 'echo hello' 或 'ls -la'。" +
    "危险命令（rm、dd 等）会被拒绝执行。",
  func: async (command) => {
    if (BLOCKED_COMMANDS.test(command)) {
      return `错误: 命令 "${command}" 包含危险操作，已被拒绝执行`;
    }
    try {
      const output = execSync(command, {
        encoding: "utf-8",
        timeout: 10000,
        stdio: ["pipe", "pipe", "pipe"],
      });
      return output.trim() || "(命令执行成功，无输出)";
    } catch (err) {
      return `执行失败: ${err.message}`;
    }
  },
});

/**
 * 工具2: 列出目录文件
 */
export const listFilesTool = new DynamicTool({
  name: "list_files",
  description:
    "列出指定目录下的文件和子目录。输入应该是目录路径，例如 '.' 或 './demos'。",
  func: async (dirPath) => {
    try {
      const output = execSync(`ls -1 "${dirPath}"`, {
        encoding: "utf-8",
        timeout: 5000,
      });
      return output.trim() || "(目录为空)";
    } catch (err) {
      return `错误: 无法列出目录 "${dirPath}"，${err.message}`;
    }
  },
});

/**
 * 工具3: 读取文件内容
 * 限制最大读取 5000 字符，防止上下文溢出
 */
export const readFileTool = new DynamicTool({
  name: "read_file",
  description:
    "读取本地文本文件的内容（最多返回 5000 个字符）。输入应该是文件路径。",
  func: async (filePath) => {
    if (!existsSync(filePath)) {
      return `错误: 文件 "${filePath}" 不存在`;
    }
    try {
      const content = readFileSync(filePath, "utf-8");
      if (content.length > 5000) {
        return (
          content.slice(0, 5000) +
          "\n\n...(内容已截断，原文件共 " + content.length + " 字符)"
        );
      }
      return content;
    } catch (err) {
      return `错误: 无法读取文件 "${filePath}"，${err.message}`;
    }
  },
});
