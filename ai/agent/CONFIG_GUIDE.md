# 🔧 配置指南

## 环境变量配置

### 必需配置

#### 1. OpenAI API Key
```bash
OPENAI_API_KEY=your_api_key_here
```

### 可选配置

#### 2. 自定义 API Base URL
```bash
OPENAI_API_BASE=https://your-custom-api-endpoint.com/v1
```

如果你使用兼容 OpenAI 格式的其他 API 服务（如企业内部部署、第三方代理等），可以配置此项。

**示例**：
```bash
# 示例 1：企业内部 API
OPENAI_API_BASE=https://api.openai.com/v1

# 示例 2：其他兼容服务
OPENAI_API_BASE=https://api.your-company.com/openai/v1
```

#### 3. SerpAPI Key（仅 demo2 需要）
```bash
SERPAPI_API_KEY=your_serpapi_key_here
```

## 快速配置步骤

### 方法 1：使用模板文件（推荐）
```bash
# 1. 复制模板文件
cp .env.example .env

# 2. 编辑 .env 文件
# 使用你喜欢的编辑器打开 .env 文件
vim .env  # 或 nano .env 或其他编辑器

# 3. 填入你的配置
# - 必需：OPENAI_API_KEY
# - 可选：OPENAI_API_BASE（如果使用自定义端点）
```

### 方法 2：直接创建
```bash
# 创建 .env 文件
cat > .env << 'EOF'
OPENAI_API_KEY=your_api_key_here
OPENAI_API_BASE=https://api.openai.com/v1
EOF
```

## 配置说明

### OPENAI_API_KEY
- **用途**: OpenAI API 认证密钥
- **获取方式**:
  - OpenAI 官方：https://platform.openai.com/api-keys
  - 企业内部：联系相关团队获取
- **必需**: 是

### OPENAI_API_BASE
- **用途**: 自定义 API 端点地址
- **默认值**: 如果不设置，使用 OpenAI 官方端点 (`https://api.openai.com/v1`)
- **使用场景**:
  - 企业内部部署的 OpenAI 兼容服务
  - 第三方 API 代理服务
  - 私有化部署的大模型服务
- **必需**: 否
- **格式要求**: 必须是完整的 URL，通常以 `/v1` 结尾

### SERPAPI_API_KEY
- **用途**: 搜索引擎 API 密钥
- **获取方式**: https://serpapi.com/
- **必需**: 否（仅 demo2 需要）

## 配置验证

运行任何示例时，程序会自动检查配置：

```bash
npm run demo1
```

### 成功的输出示例

**使用自定义端点**：
```
🔗 使用自定义 API Base URL: https://api.openai.com/v1

🤖 基础 ReAct Agent 示例
==================================================
```

**使用默认端点**：
```
🤖 基础 ReAct Agent 示例
==================================================
```

### 错误的输出示例

**缺少 API Key**：
```
❌ 错误: 未配置 OPENAI_API_KEY
请在 .env 文件中添加 OPENAI_API_KEY
```

## 不同场景的配置

### 场景 1：使用 OpenAI 官方服务
```bash
# .env
OPENAI_API_KEY=sk-xxx
# 不设置 OPENAI_API_BASE，使用默认端点
```

### 场景 2：使用自定义兼容服务
```bash
# .env
OPENAI_API_KEY=your_custom_api_key
OPENAI_API_BASE=https://api.openai.com/v1
```

### 场景 3：使用第三方代理
```bash
# .env
OPENAI_API_KEY=sk-xxx
OPENAI_API_BASE=https://proxy.example.com/v1
```

## 模型配置

### 默认模型
所有示例默认使用 `gpt-4` 模型。

### 修改默认模型
编辑 `demos/config.js` 文件：

```javascript
export function getLLMConfig(options = {}) {
  const config = {
    modelName: options.modelName || "gpt-3.5-turbo", // 修改这里
    temperature: options.temperature ?? 0,
  };
  // ...
}
```

### 在单个示例中使用不同模型
```javascript
import { getLLMConfig } from "./config.js";

// 使用 GPT-3.5
const model = new ChatOpenAI(getLLMConfig({
  modelName: "gpt-3.5-turbo"
}));

// 使用 GPT-4
const model = new ChatOpenAI(getLLMConfig({
  modelName: "gpt-4"
}));

// 调整 temperature
const model = new ChatOpenAI(getLLMConfig({
  temperature: 0.7
}));
```

## 高级配置

### 配置文件详解

`demos/config.js` 是统一的配置管理模块：

```javascript
import * as dotenv from "dotenv";

dotenv.config();

/**
 * 获取 LLM 配置
 */
export function getLLMConfig(options = {}) {
  const config = {
    modelName: options.modelName || "gpt-4",
    temperature: options.temperature ?? 0,
  };

  // 如果配置了自定义 Base URL，则使用
  if (process.env.OPENAI_API_BASE) {
    config.configuration = {
      baseURL: process.env.OPENAI_API_BASE,
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
```

### 添加更多配置选项

如果需要添加其他配置，可以扩展 `config.js`：

```javascript
export function getLLMConfig(options = {}) {
  const config = {
    modelName: options.modelName || process.env.DEFAULT_MODEL || "gpt-4",
    temperature: options.temperature ?? parseFloat(process.env.DEFAULT_TEMPERATURE || "0"),
    maxTokens: options.maxTokens || parseInt(process.env.MAX_TOKENS || "2000"),
  };

  if (process.env.OPENAI_API_BASE) {
    config.configuration = {
      baseURL: process.env.OPENAI_API_BASE,
    };
  }

  return config;
}
```

## 常见问题

### Q: 如何确认配置是否正确？
A: 运行任何示例，观察输出：
- 如果配置了自定义端点，会显示 "🔗 使用自定义 API Base URL"
- 如果缺少必需配置，会显示错误提示

### Q: 可以不配置 OPENAI_API_BASE 吗？
A: 可以。如果不配置，将使用 OpenAI 官方端点。

### Q: 如何切换到 OpenAI 官方端点？
A: 在 `.env` 文件中注释掉或删除 `OPENAI_API_BASE` 行：
```bash
OPENAI_API_KEY=sk-xxx
# OPENAI_API_BASE=https://api.openai.com/v1
```

### Q: 支持哪些兼容服务？
A: 支持所有兼容 OpenAI API 格式的服务，包括：
- Azure OpenAI
- 企业内部部署的服务
- 第三方 API 代理
- 开源的兼容实现（如 LocalAI、FastChat 等）

### Q: 如何验证自定义端点是否可用？
A: 可以使用 curl 测试：
```bash
curl https://your-custom-endpoint.com/v1/models \
  -H "Authorization: Bearer your_api_key"
```

### Q: 多个项目如何管理不同的配置？
A: 每个项目使用独立的 `.env` 文件，不要提交到 Git。

### Q: 配置文件的优先级？
A:
1. 代码中直接传入的参数（最高优先级）
2. 环境变量（.env 文件）
3. config.js 中的默认值（最低优先级）

## 安全建议

### ⚠️ 重要提示

1. **不要提交 .env 文件到 Git**
   - `.env` 已在 `.gitignore` 中
   - 只提交 `.env.example` 模板

2. **不要在代码中硬编码 API Key**
   - 始终使用环境变量
   - 使用 `process.env.OPENAI_API_KEY`

3. **定期轮换 API Key**
   - 定期更新 API Key
   - 发现泄露立即更换

4. **限制 API Key 权限**
   - 使用最小权限原则
   - 为不同环境使用不同的 Key

5. **保护配置文件**
   - 设置适当的文件权限
   - 不要分享包含真实 Key 的截图

## 配置文件结构

```
agent/
├── .env                    # 你的配置（不提交到 Git）⚠️
├── .env.example           # 配置模板（提交到 Git）✅
├── .gitignore             # 确保 .env 被忽略
└── demos/
    └── config.js          # 配置管理模块
```

## 环境变量优先级

1. **系统环境变量**（最高）
2. **.env 文件**
3. **代码默认值**（最低）

示例：
```bash
# 方式 1：使用 .env 文件
# 在 .env 中设置
OPENAI_API_KEY=xxx

# 方式 2：命令行传入
OPENAI_API_KEY=xxx npm run demo1

# 方式 3：系统环境变量
export OPENAI_API_KEY=xxx
npm run demo1
```

## 调试配置

### 创建测试脚本

```javascript
// test-config.js
import { getLLMConfig, checkEnvConfig } from "./demos/config.js";

console.log("=== 配置检查 ===\n");
checkEnvConfig();

console.log("=== LLM 配置 ===");
console.log(JSON.stringify(getLLMConfig(), null, 2));

console.log("\n=== 环境变量 ===");
console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "已设置" : "未设置");
console.log("OPENAI_API_BASE:", process.env.OPENAI_API_BASE || "未设置（使用默认）");
```

运行测试：
```bash
node test-config.js
```

## 总结

### 快速检查清单

- [ ] 已复制 `.env.example` 为 `.env`
- [ ] 已配置 `OPENAI_API_KEY`
- [ ] （可选）已配置 `OPENAI_API_BASE`
- [ ] `.env` 文件不会被提交到 Git
- [ ] 运行示例验证配置正确

### 最小配置

```bash
# .env
OPENAI_API_KEY=your_api_key_here
```

### 完整配置

```bash
# .env
OPENAI_API_KEY=your_api_key_here
OPENAI_API_BASE=https://api.openai.com/v1
SERPAPI_API_KEY=your_serpapi_key_here
```

现在你可以开始使用了！🚀

```bash
npm install
cp .env.example .env
# 编辑 .env 添加你的配置
npm start
```
