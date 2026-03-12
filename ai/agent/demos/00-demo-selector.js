/**
 * Demo 0: 示例选择器
 *
 * 这是一个交互式的示例选择器，帮助你快速找到合适的学习示例
 */

import readline from 'readline';

const demos = [
  {
    id: 1,
    name: "基础 ReAct Agent",
    command: "npm run demo1",
    difficulty: "⭐",
    concepts: ["ReAct 模式", "Agent 基础"],
    description: "最基础的 Agent 示例，展示 ReAct (推理+行动) 模式",
    recommended: true,
  },
  {
    id: 2,
    name: "搜索 Agent",
    command: "npm run demo2",
    difficulty: "⭐⭐⭐",
    concepts: ["外部 API", "搜索集成"],
    description: "集成搜索引擎的 Agent，可以进行实时信息检索",
    requiresConfig: "SERPAPI_API_KEY",
  },
  {
    id: 3,
    name: "计算器 Agent",
    command: "npm run demo3",
    difficulty: "⭐",
    concepts: ["工具使用", "迭代控制"],
    description: "具备数学计算能力的 Agent",
    recommended: true,
  },
  {
    id: 4,
    name: "对话记忆 Agent",
    command: "npm run demo4",
    difficulty: "⭐⭐",
    concepts: ["BufferMemory", "多轮对话"],
    description: "带有对话历史记忆的 Agent，可以进行连贯的多轮对话",
  },
  {
    id: 5,
    name: "自定义工具 Agent",
    command: "npm run demo5",
    difficulty: "⭐⭐",
    concepts: ["DynamicTool", "自定义工具"],
    description: "展示如何创建和使用自定义工具",
    recommended: true,
  },
  {
    id: 6,
    name: "多 Agent 协作",
    command: "npm run demo6",
    difficulty: "⭐⭐⭐",
    concepts: ["多 Agent", "任务分发"],
    description: "多个专门的 Agent 协作完成复杂任务",
  },
  {
    id: 7,
    name: "结构化输出 Agent",
    command: "npm run demo7",
    difficulty: "⭐⭐⭐",
    concepts: ["DynamicStructuredTool", "Zod Schema"],
    description: "返回结构化 JSON 数据的 Agent",
  },
  {
    id: 8,
    name: "错误处理 Agent",
    command: "npm run demo8",
    difficulty: "⭐⭐⭐",
    concepts: ["错误处理", "重试机制"],
    description: "优雅地处理各种错误场景",
  },
  {
    id: 9,
    name: "Shell 工具 + 自定义 Skill Agent",
    command: "npm run demo9",
    difficulty: "⭐⭐⭐",
    concepts: ["DynamicTool", "DynamicStructuredTool", "Skill", "Shell 执行", "代码格式化"],
    description: "演示自定义 Shell 工具与高阶 Skill 封装（代码格式化）的区别与用法",
    recommended: false,
  },
];

const learningPaths = {
  beginner: [1, 3, 5],
  intermediate: [4, 7, 8],
  advanced: [6, 2],
  full: [1, 3, 5, 4, 7, 8, 6, 2],
};

function displayWelcome() {
  console.clear();
  console.log("╔═══════════════════════════════════════════════════════════════╗");
  console.log("║                                                               ║");
  console.log("║           🤖 LangChain Agent 示例选择器 🤖                    ║");
  console.log("║                                                               ║");
  console.log("╚═══════════════════════════════════════════════════════════════╝");
  console.log();
}

function displayMenu() {
  console.log("请选择操作：\n");
  console.log("  [1] 查看所有示例");
  console.log("  [2] 按难度筛选");
  console.log("  [3] 查看推荐学习路径");
  console.log("  [4] 搜索示例");
  console.log("  [5] 查看详细信息");
  console.log("  [0] 退出");
  console.log();
}

function displayAllDemos() {
  console.clear();
  displayWelcome();
  console.log("📚 所有示例：\n");

  demos.forEach((demo) => {
    console.log(`${demo.id}. ${demo.name}`);
    console.log(`   难度: ${demo.difficulty}`);
    console.log(`   概念: ${demo.concepts.join(", ")}`);
    console.log(`   描述: ${demo.description}`);
    if (demo.recommended) {
      console.log(`   🌟 推荐新手学习`);
    }
    if (demo.requiresConfig) {
      console.log(`   ⚠️  需要配置: ${demo.requiresConfig}`);
    }
    console.log(`   运行: ${demo.command}`);
    console.log();
  });
}

function displayByDifficulty(difficulty) {
  const filtered = demos.filter((d) => d.difficulty === difficulty);

  console.clear();
  displayWelcome();
  console.log(`📊 难度 ${difficulty} 的示例：\n`);

  filtered.forEach((demo) => {
    console.log(`${demo.id}. ${demo.name}`);
    console.log(`   ${demo.description}`);
    console.log(`   运行: ${demo.command}`);
    console.log();
  });
}

function displayLearningPath(pathName) {
  const path = learningPaths[pathName];

  console.clear();
  displayWelcome();

  const pathNames = {
    beginner: "初学者路径 (推荐新手)",
    intermediate: "进阶路径",
    advanced: "高级路径",
    full: "完整路径",
  };

  console.log(`🎯 ${pathNames[pathName]}：\n`);

  path.forEach((id, index) => {
    const demo = demos.find((d) => d.id === id);
    console.log(`第 ${index + 1} 步: ${demo.name}`);
    console.log(`       难度: ${demo.difficulty}`);
    console.log(`       概念: ${demo.concepts.join(", ")}`);
    console.log(`       运行: ${demo.command}`);
    console.log();
  });
}

function searchDemos(keyword) {
  const results = demos.filter(
    (d) =>
      d.name.toLowerCase().includes(keyword.toLowerCase()) ||
      d.description.toLowerCase().includes(keyword.toLowerCase()) ||
      d.concepts.some((c) => c.toLowerCase().includes(keyword.toLowerCase()))
  );

  console.clear();
  displayWelcome();
  console.log(`🔍 搜索 "${keyword}" 的结果：\n`);

  if (results.length === 0) {
    console.log("未找到匹配的示例。\n");
  } else {
    results.forEach((demo) => {
      console.log(`${demo.id}. ${demo.name}`);
      console.log(`   ${demo.description}`);
      console.log(`   运行: ${demo.command}`);
      console.log();
    });
  }
}

function displayDemoDetail(id) {
  const demo = demos.find((d) => d.id === id);

  if (!demo) {
    console.log("示例不存在。\n");
    return;
  }

  console.clear();
  displayWelcome();
  console.log(`📖 示例详情：\n`);
  console.log(`名称: ${demo.name}`);
  console.log(`难度: ${demo.difficulty}`);
  console.log(`核心概念: ${demo.concepts.join(", ")}`);
  console.log(`描述: ${demo.description}`);
  if (demo.recommended) {
    console.log(`🌟 推荐新手学习`);
  }
  if (demo.requiresConfig) {
    console.log(`⚠️  需要配置: ${demo.requiresConfig}`);
  }
  console.log(`\n运行命令: ${demo.command}`);
  console.log();
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  let running = true;

  while (running) {
    console.clear();
    displayWelcome();
    displayMenu();

    const choice = await question("请输入选项 [0-5]: ");

    switch (choice.trim()) {
      case "1":
        displayAllDemos();
        await question("\n按回车键继续...");
        break;

      case "2":
        console.clear();
        displayWelcome();
        console.log("选择难度：\n");
        console.log("  [1] ⭐ (简单)");
        console.log("  [2] ⭐⭐ (中等)");
        console.log("  [3] ⭐⭐⭐ (困难)");
        console.log();

        const diffChoice = await question("请输入选项 [1-3]: ");
        const difficulties = ["⭐", "⭐⭐", "⭐⭐⭐"];
        const selectedDiff = difficulties[parseInt(diffChoice) - 1];

        if (selectedDiff) {
          displayByDifficulty(selectedDiff);
          await question("\n按回车键继续...");
        }
        break;

      case "3":
        console.clear();
        displayWelcome();
        console.log("选择学习路径：\n");
        console.log("  [1] 初学者路径 (推荐新手)");
        console.log("  [2] 进阶路径");
        console.log("  [3] 高级路径");
        console.log("  [4] 完整路径");
        console.log();

        const pathChoice = await question("请输入选项 [1-4]: ");
        const paths = ["beginner", "intermediate", "advanced", "full"];
        const selectedPath = paths[parseInt(pathChoice) - 1];

        if (selectedPath) {
          displayLearningPath(selectedPath);
          await question("\n按回车键继续...");
        }
        break;

      case "4":
        console.clear();
        displayWelcome();
        const keyword = await question("请输入搜索关键词: ");
        searchDemos(keyword);
        await question("\n按回车键继续...");
        break;

      case "5":
        console.clear();
        displayWelcome();
        const demoId = await question("请输入示例编号 [1-8]: ");
        displayDemoDetail(parseInt(demoId));
        await question("\n按回车键继续...");
        break;

      case "0":
        console.clear();
        displayWelcome();
        console.log("👋 感谢使用！祝学习愉快！\n");
        running = false;
        break;

      default:
        console.log("\n❌ 无效的选项，请重新选择。");
        await question("\n按回车键继续...");
    }
  }

  rl.close();
}

main().catch(console.error);
