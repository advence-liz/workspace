import { pull } from "langchain/hub";

async function main() {
  console.log("📊 对比 react 和 react-chat 两个 Prompt\n");
  console.log("=" .repeat(70));

  // 拉取两个 prompt
  const reactPrompt = await pull("hwchase17/react");
  const reactChatPrompt = await pull("hwchase17/react-chat");

  console.log("\n🔹 hwchase17/react (标准版)");
  console.log("=" .repeat(70));
  console.log(reactPrompt.template);
  console.log("\n输入变量:", reactPrompt.inputVariables);

  console.log("\n\n🔹 hwchase17/react-chat (对话版)");
  console.log("=" .repeat(70));
  console.log(reactChatPrompt.template);
  console.log("\n输入变量:", reactChatPrompt.inputVariables);

  console.log("\n\n📊 关键差异分析");
  console.log("=" .repeat(70));
  
  // 检查是否包含 chat_history
  const reactHasHistory = reactPrompt.template.includes('chat_history');
  const reactChatHasHistory = reactChatPrompt.template.includes('chat_history');
  
  console.log("✓ react 包含 chat_history:", reactHasHistory ? "是" : "否");
  console.log("✓ react-chat 包含 chat_history:", reactChatHasHistory ? "是" : "否");
  
  // 检查字数
  console.log("\n长度对比:");
  console.log("✓ react 字符数:", reactPrompt.template.length);
  console.log("✓ react-chat 字符数:", reactChatPrompt.template.length);
  
  // 检查是否有特定的限定
  const hasOpenAI = reactChatPrompt.template.includes('OpenAI');
  const hasAssistant = reactChatPrompt.template.includes('Assistant');
  
  console.log("\n特定限定:");
  console.log("✓ 提到 OpenAI:", hasOpenAI ? "是 ⚠️" : "否");
  console.log("✓ 提到 Assistant:", hasAssistant ? "是 ⚠️" : "否");
}

main();
