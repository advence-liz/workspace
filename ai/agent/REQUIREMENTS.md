# 📋 系统要求

## Node.js 环境

### 最低要求
- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0

### 推荐版本
- **Node.js**: 18.x LTS 或 20.x LTS
- **npm**: 最新稳定版

### 为什么需要 Node.js 18+？

1. **ES Modules 支持**
   - 本项目使用 ES Modules (`type: "module"`)
   - 需要 Node.js 对 ESM 的完整支持

2. **LangChain 依赖要求**
   - `@langchain/core` 需要 Node.js >= 18
   - 使用了现代 JavaScript 特性

3. **Fetch API**
   - Node.js 18+ 内置了 Fetch API
   - LangChain 使用 Fetch 进行 HTTP 请求

## 检查当前版本

```bash
# 检查 Node.js 版本
node --version

# 检查 npm 版本
npm --version
```

**期望输出**：
```
v18.20.8  (或更高)
10.8.2    (或更高)
```

## 安装 Node.js

### 方法 1：官方安装包（推荐）

访问 [Node.js 官网](https://nodejs.org/)，下载并安装 LTS 版本。

- **Windows**: 下载 `.msi` 安装包
- **macOS**: 下载 `.pkg` 安装包
- **Linux**: 根据发行版选择安装方式

### 方法 2：使用 nvm（推荐开发者）

nvm (Node Version Manager) 可以方便地管理多个 Node.js 版本。

#### 安装 nvm

**macOS/Linux**:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

**Windows**:
下载 [nvm-windows](https://github.com/coreybutler/nvm-windows/releases)

#### 使用 nvm 安装 Node.js

```bash
# 安装最新的 LTS 版本
nvm install --lts

# 或安装特定版本
nvm install 18
nvm install 20

# 使用特定版本
nvm use 18

# 设置默认版本
nvm alias default 18
```

### 方法 3：使用包管理器

#### macOS (Homebrew)
```bash
brew install node@18
# 或
brew install node@20
```

#### Ubuntu/Debian
```bash
# 使用 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### CentOS/RHEL
```bash
# 使用 NodeSource 仓库
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

## 升级 Node.js

### 如果你已经安装了旧版本

#### 使用 nvm
```bash
nvm install 18
nvm use 18
nvm alias default 18
```

#### 重新安装
从 [Node.js 官网](https://nodejs.org/) 下载最新的 LTS 版本并安装。

## 升级 npm

如果 Node.js 版本符合要求，但 npm 版本过低：

```bash
# 升级到最新版本
npm install -g npm@latest

# 或升级到特定版本
npm install -g npm@10
```

## 验证安装

安装或升级后，验证版本：

```bash
# 检查 Node.js
node --version
# 期望: v18.0.0 或更高

# 检查 npm
npm --version
# 期望: 8.0.0 或更高

# 测试 Node.js 是否正常工作
node -e "console.log('Node.js 工作正常！')"
```

## 其他依赖

### 操作系统
- **Windows**: Windows 10 或更高
- **macOS**: macOS 10.15 (Catalina) 或更高
- **Linux**: 主流发行版（Ubuntu 18.04+, Debian 10+, CentOS 7+）

### 磁盘空间
- **最小**: 100 MB（仅项目依赖）
- **推荐**: 500 MB（包括 Node.js 和其他工具）

### 内存
- **最小**: 2 GB RAM
- **推荐**: 4 GB RAM 或更高

### 网络
- 需要访问 npm registry (https://registry.npmjs.org/)
- 需要访问 OpenAI API 或你配置的自定义端点
- 如果使用搜索功能，需要访问 SerpAPI

## 常见问题

### Q: 我的 Node.js 版本是 16.x，可以运行吗？
A: 不推荐。虽然可能部分功能可以工作，但 LangChain 官方要求 Node.js >= 18。建议升级到 18.x 或 20.x LTS。

### Q: 我应该使用 Node.js 18 还是 20？
A: 两者都可以。推荐使用最新的 LTS 版本（目前是 20.x）。

### Q: 如何在不影响其他项目的情况下使用不同的 Node.js 版本？
A: 使用 nvm 可以轻松切换不同版本：
```bash
nvm install 18
nvm use 18
```

### Q: 安装依赖时出现权限错误怎么办？
A: 不要使用 `sudo npm install`。推荐：
1. 使用 nvm 安装 Node.js（避免权限问题）
2. 或配置 npm 的全局目录：
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### Q: npm install 很慢怎么办？
A: 可以使用国内镜像：
```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com

# 或使用 cnpm
npm install -g cnpm --registry=https://registry.npmmirror.com
cnpm install
```

### Q: 如何检查项目需要的 Node.js 版本？
A: 查看 `package.json` 中的 `engines` 字段：
```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

## 开发工具推荐

### 代码编辑器
- **VS Code** (推荐)
  - 安装 ESLint 插件
  - 安装 Prettier 插件
- **WebStorm**
- **Sublime Text**

### 终端工具
- **macOS**: iTerm2
- **Windows**: Windows Terminal
- **Linux**: 默认终端或 Terminator

### Git
- 版本控制需要 Git
- 下载：https://git-scm.com/

## 项目依赖说明

本项目的主要依赖：

```json
{
  "@langchain/community": "^0.3.0",    // LangChain 社区工具
  "@langchain/core": "^0.3.0",         // LangChain 核心
  "@langchain/openai": "^0.3.0",       // OpenAI 集成
  "langchain": "^0.3.0",               // LangChain 主包
  "dotenv": "^16.4.5",                 // 环境变量管理
  "zod": "^3.22.4"                     // Schema 验证
}
```

所有依赖都兼容 Node.js 18+。

## 故障排除

### 问题：node 命令未找到
```bash
# 检查是否安装了 Node.js
which node

# 如果未安装，按照上面的方法安装
```

### 问题：版本不符合要求
```bash
# 升级 Node.js
# 使用 nvm 或重新安装
```

### 问题：npm install 失败
```bash
# 清除 npm 缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 问题：权限错误
```bash
# 不要使用 sudo
# 使用 nvm 或配置 npm 全局目录
```

## 总结

✅ **最低要求**: Node.js >= 18.0.0, npm >= 8.0.0
✅ **推荐版本**: Node.js 20.x LTS
✅ **安装方式**: 官方安装包或 nvm
✅ **验证方法**: `node --version` 和 `npm --version`

如果你的环境符合要求，现在可以开始安装项目依赖了：

```bash
npm install
```
