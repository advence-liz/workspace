# 🚀 从这里开始

## 📋 环境要求

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0

检查版本：
```bash
node --version  # 应该 >= v18.0.0
npm --version   # 应该 >= 8.0.0
```

💡 如果版本不符合要求，请先安装或升级 Node.js：https://nodejs.org/

---

## ⚡ 三步快速开始

### 第 1 步：安装依赖
```bash
npm install
```

### 第 2 步：配置 API Key
```bash
cp .env.example .env
```
然后编辑 `.env` 文件，添加你的配置：
```
OPENAI_API_KEY=your_api_key_here

# 可选：如果使用自定义 API 端点
OPENAI_API_BASE=https://api.openai.com/v1
```

💡 **注意**: 本项目支持自定义 OpenAI 兼容的 API 端点
📖 详细配置说明请查看 [CONFIG_GUIDE.md](CONFIG_GUIDE.md)

### 第 3 步：运行示例
```bash
npm start
```

就这么简单！🎉

---

## 📚 文档导航

### 🆕 新手必读
1. **START_HERE.md** ← 你在这里
2. **QUICKSTART.md** - 快速入门指南
3. **README.md** - 项目完整介绍

### 📖 深入学习
4. **CONCEPTS.md** - 核心概念详解
5. **PROJECT_STRUCTURE.md** - 项目结构说明
6. **SUMMARY.md** - 项目总结

---

## 🎯 推荐学习顺序

### 方式 1：使用交互式选择器（推荐）
```bash
npm start
```
然后选择"初学者路径"

### 方式 2：手动运行示例
```bash
npm run demo1    # 基础 ReAct Agent
npm run demo3    # 计算器 Agent
npm run demo5    # 自定义工具 Agent
```

---

## 💡 提示

- 📖 **不确定从哪开始？** 运行 `npm start` 使用交互式选择器
- 🤔 **想了解概念？** 阅读 `CONCEPTS.md`
- 🔧 **遇到问题？** 查看 `QUICKSTART.md` 的常见问题部分
- 🚀 **准备好实践？** 直接运行 `npm run demo1`

---

## 🌟 你将学到什么

✅ 什么是 Agent 以及如何工作
✅ ReAct（推理+行动）模式
✅ 如何使用和创建工具
✅ 如何实现对话记忆
✅ 如何处理错误
✅ 如何构建多 Agent 系统

---

## 📞 需要帮助？

- 📚 查看 [QUICKSTART.md](QUICKSTART.md) 获取快速帮助
- 📖 阅读 [CONCEPTS.md](CONCEPTS.md) 理解原理
- 🔍 查看 [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) 了解结构

---

**现在就开始吧！** 🎊

```bash
npm install && npm start
```
