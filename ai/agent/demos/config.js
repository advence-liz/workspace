/**
 * 通用配置文件
 *
 * 用于统一管理 LLM 配置，支持自定义 API Base URL
 */

import * as dotenv from "dotenv";

dotenv.config();

/**
 * 获取 LLM 配置
 * @param {Object} options - 额外的配置选项
 * @returns {Object} LLM 配置对象
 */
export function getLLMConfig(options = {}) {
  const config = {
    modelName: options.modelName || "gpt-4",
    temperature: options.temperature ?? 0,
  };

  // 如果配置了自定义 Base URL，则使用
  if (process.env.OPENAI_API_BASE) {
    config.configuration = {
      basePath: process.env.OPENAI_API_BASE,
    };
  }

  return config;
}

/**
 * 检查环境变量配置
 */
export function checkEnvConfig() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ 错误: 未配置 OPENAI_API_KEY");
    console.error("请在 .env 文件中添加 OPENAI_API_KEY\n");
    process.exit(1);
  }

  if (process.env.OPENAI_API_BASE) {
    console.log(`🔗 使用自定义 API Base URL: ${process.env.OPENAI_API_BASE}\n`);
  }
}
