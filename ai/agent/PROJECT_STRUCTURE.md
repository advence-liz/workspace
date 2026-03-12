# 📁 项目结构说明

## 目录树
```
agent/
├── README.md                    # 项目主文档
├── QUICKSTART.md               # 快速入门指南
├── CONCEPTS.md                 # 核心概念详解
├── PROJECT_STRUCTURE.md        # 本文件
├── package.json                # 项目配置
├── .env.example               # 环境变量示例
├── .gitignore                 # Git 忽略文件
│
└── demos/                      # 示例代码目录
    ├── 01-basic-react-agent.js              # 基础 ReAct Agent
    ├── 02-search-agent.js                   # 搜索 Agent
    ├── 03-calculator-agent.js               # 计算器 Agent
    ├── 04-memory-agent.js                   # 带记忆的 Agent
    ├── 05-custom-tools-agent.js             # 自定义工具 Agent
    ├── 06-multi-agent-collaboration.js      # 多 Agent 协作
    ├── 07-structured-output-agent.js        # 结构化输出 Agent
    └── 08-error-handling-agent.js           # 错误处理 Agent
```

## 文件说明

### 📄 根目录文件

#### README.md
- **作用**: 项目主文档
- **内容**:
  - 项目介绍
  - 环境要求
  - 安装说明
  - 所有示例的简介
  - 学习路径建议
  - 参考资源

#### REQUIREMENTS.md
- **作用**: 详细的系统要求说明
- **内容**:
  - Node.js 版本要求
  - 安装和升级指南
  - 环境验证方法
  - 常见问题解决
  - 开发工具推荐

#### QUICKSTART.md
- **作用**: 快速入门指南
- **内容**:
  - 三步快速开始
  - 每个示例的详细说明（难度、学习目标）
  - 学习路线建议
  - 核心概念速查
  - 常见问题解答

#### CONCEPTS.md
- **作用**: 深入讲解核心概念
- **内容**:
  - Agent 是什么
  - ReAct 模式详解
  - Tools 工具系统
  - Memory 记忆管理
  - Chains 链式调用
  - Agent 类型
  - 最佳实践
  - 调试技巧

#### package.json
- **作用**: 项目配置文件
- **包含**:
  - 依赖包列表
  - 运行脚本（npm run demo1-8）
  - 项目元信息

#### .env.example
- **作用**: 环境变量模板
- **包含**:
  - OPENAI_API_KEY（必需）
  - OPENAI_API_BASE（可选，自定义 API 端点）
  - SERPAPI_API_KEY（可选，仅 demo2 需要）

#### CONFIG_GUIDE.md
- **作用**: 详细的配置指南
- **内容**:
  - 环境变量说明
  - 自定义 API 端点配置
  - 模型配置
  - 安全建议
  - 常见问题

### 📂 demos/ 目录

#### config.js
- **作用**: 统一的配置管理模块
- **功能**:
  - `getLLMConfig()` - 获取 LLM 配置
  - `checkEnvConfig()` - 检查环境变量
  - 自动处理自定义 Base URL
- **使用**: 所有示例都使用此模块

#### 01-basic-react-agent.js
- **难度**: ⭐
- **核心概念**: ReAct 模式、Agent 基础
- **工具**: Calculator
- **学习重点**: 理解 Agent 的工作流程

#### 02-search-agent.js
- **难度**: ⭐⭐⭐
- **核心概念**: 外部 API 集成
- **工具**: SerpAPI
- **学习重点**: 集成第三方服务
- **注意**: 需要配置 SERPAPI_API_KEY

#### 03-calculator-agent.js
- **难度**: ⭐
- **核心概念**: 工具使用、迭代控制
- **工具**: Calculator
- **学习重点**: 掌握工具调用

#### 04-memory-agent.js
- **难度**: ⭐⭐
- **核心概念**: BufferMemory、多轮对话
- **工具**: Calculator + Memory
- **学习重点**: 实现对话记忆

#### 05-custom-tools-agent.js
- **难度**: ⭐⭐
- **核心概念**: DynamicTool、自定义工具
- **工具**: 自定义工具（字符串处理、时间查询等）
- **学习重点**: 创建自己的工具

#### 06-multi-agent-collaboration.js
- **难度**: ⭐⭐⭐
- **核心概念**: 多 Agent 协作、任务分发
- **工具**: 多个专家 Agent
- **学习重点**: Agent 组合模式

#### 07-structured-output-agent.js
- **难度**: ⭐⭐⭐
- **核心概念**: DynamicStructuredTool、Zod Schema
- **工具**: 结构化工具
- **学习重点**: 类型安全的工具定义

#### 08-error-handling-agent.js
- **难度**: ⭐⭐⭐
- **核心概念**: 错误处理、重试机制
- **工具**: 各种可能失败的工具
- **学习重点**: 优雅处理错误

## 运行命令速查

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 然后编辑 .env 文件

# 运行示例（按推荐顺序）
npm run demo1    # 基础 ReAct Agent
npm run demo3    # 计算器 Agent
npm run demo5    # 自定义工具 Agent
npm run demo4    # 带记忆的 Agent
npm run demo7    # 结构化输出 Agent
npm run demo8    # 错误处理 Agent
npm run demo6    # 多 Agent 协作
npm run demo2    # 搜索 Agent（需要额外配置）
```

## 学习路径

### 🎯 快速体验（30分钟）
```
demo1 → demo3 → demo5
```
了解 Agent 基础和工具使用

### 📚 完整学习（2-3小时）
```
demo1 → demo3 → demo5 → demo4 → demo7 → demo8 → demo6
```
系统掌握所有核心概念

### 🚀 进阶实践（1天）
```
完整学习 → 修改代码 → 创建自己的工具 → 构建实际应用
```

## 代码结构模式

每个示例都遵循相同的结构：

```javascript
// 1. 导入依赖
import { ... } from "...";

// 2. 主函数
async function main() {
  console.log("示例标题");

  // 3. 初始化 LLM
  const model = new ChatOpenAI({ ... });

  // 4. 定义工具
  const tools = [ ... ];

  // 5. 获取 Prompt
  const prompt = await pull("hwchase17/react");

  // 6. 创建 Agent
  const agent = await createReactAgent({ ... });

  // 7. 创建执行器
  const agentExecutor = new AgentExecutor({ ... });

  // 8. 运行示例
  const result = await agentExecutor.invoke({ ... });
}

// 3. 执行
main().catch(console.error);
```

## 依赖说明

### 核心依赖
- `@langchain/openai`: OpenAI 集成
- `@langchain/core`: LangChain 核心功能
- `@langchain/community`: 社区工具集
- `langchain`: 主包

### 辅助依赖
- `dotenv`: 环境变量管理
- `zod`: Schema 验证（demo7 使用）

## 扩展建议

### 添加新示例
1. 在 `demos/` 目录创建新文件
2. 遵循现有的代码结构
3. 在 `package.json` 添加运行脚本
4. 更新 `README.md` 和 `QUICKSTART.md`

### 自定义配置
1. 修改模型名称（GPT-4/GPT-3.5）
2. 调整 temperature（0-1）
3. 设置 maxIterations
4. 启用/禁用 verbose 模式

### 集成到项目
1. 复制需要的示例代码
2. 根据需求修改工具
3. 调整 Prompt
4. 添加错误处理
5. 集成到业务逻辑

## 故障排除

### 常见错误

#### 1. "OPENAI_API_KEY not found"
- **原因**: 未配置环境变量
- **解决**: 复制 `.env.example` 为 `.env` 并填入 API Key

#### 2. "Module not found"
- **原因**: 依赖未安装
- **解决**: 运行 `npm install`

#### 3. "SERPAPI_API_KEY not found" (demo2)
- **原因**: 未配置搜索 API Key
- **解决**: 在 https://serpapi.com/ 注册并获取 Key

#### 4. "Agent stopped due to max iterations"
- **原因**: Agent 执行步骤超过限制
- **解决**: 增加 `maxIterations` 或简化任务

## 性能优化建议

1. **开发环境**
   - 启用 `verbose: true` 查看详细日志
   - 使用 GPT-3.5 降低成本

2. **生产环境**
   - 禁用 `verbose: false`
   - 根据需求选择合适的模型
   - 启用缓存机制
   - 设置合理的超时时间

## 安全注意事项

1. **API Key 管理**
   - 不要提交 `.env` 文件到 Git
   - 使用环境变量存储敏感信息
   - 定期轮换 API Key

2. **工具安全**
   - 验证工具输入
   - 限制工具权限
   - 记录工具调用日志

3. **错误处理**
   - 不要暴露敏感错误信息
   - 实现重试机制
   - 设置超时限制

## 贡献指南

欢迎提交 PR 添加新的示例！

要求：
1. 代码清晰，注释完整
2. 遵循现有的代码结构
3. 包含详细的说明文档
4. 测试通过

## 许可证

MIT License

## 联系方式

- 问题反馈: 提交 GitHub Issue
- 讨论交流: 参与 GitHub Discussions
