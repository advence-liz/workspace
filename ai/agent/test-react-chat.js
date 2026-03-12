/**
 * 测试 hwchase17/react-chat prompt
 */

import { pull } from "langchain/hub";

async function main() {
  console.log("📋 正在拉取 hwchase17/react-chat prompt...\n");

  try {
    const prompt = await pull("hwchase17/react-chat");

    console.log("✅ 成功拉取 prompt\n");
    console.log("=" .repeat(60));
    console.log("Prompt 模板内容:");
    console.log("=" .repeat(60));
    console.log(prompt.template);
    console.log("\n" + "=" .repeat(60));
    console.log("输入变量:");
    console.log("=" .repeat(60));
    console.log(prompt.inputVariables);

  } catch (error) {
    console.error("❌ 错误:", error.message);
  }
}

main();
