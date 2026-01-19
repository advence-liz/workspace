# CLAUDE.md - Full Stack JS/TS Guidelines

## 🛡️ 核心原则：一致性优先 (Consistency First)
**关键**：在编写代码前，必须先分析当前文件和项目的风格。
1.  **存量代码 (Legacy)**：
    - **严格模仿现有风格**。如果当前文件使用的是 React Class 组件，就继续使用 Class 写法。如果使用的是 Vue Options API，就不要混用 Composition API。
    - **禁止随意重构**。除非我明确要求，否则不要将旧语法升级为现代语法（如将 JS 改为 TS，或将 Promise 改为 async/await）。
    - 修复 Bug 时，"风格一致" 比 "技术先进" 更重要。
2.  **新增代码 (New)**：
    - 应用下方定义的 **现代标准 (Modern Standards)**。

## 🧠 现代标准 (仅适用于新文件)
- **通用 JS/TS**：
    - 默认使用 **TypeScript** (Strict mode)。
    - 使用 `async/await`，`const`/`let`，以及箭头函数。
    - 优先使用函数式编程模式（NestJS 除外）。

- **React (新增)**：
    - 仅使用 **函数式组件 (Functional Components)** + Hooks。
    - 状态管理：优先 Zustand/Redux Toolkit 或 Context API。
    - 样式：参考项目配置 (CSS Modules / Styled Components / Tailwind)。

- **Vue (新增)**：
    - 使用 **Vue 3 + Composition API** (`<script setup lang="ts">`)。
    - 明确使用 `ref`/`computed`。
    - 状态管理使用 Pinia。

- **NestJS**：
    - 严格遵循 **依赖注入 (DI)**。
    - 使用 DTO 并配合 `class-validator`。
    - 架构分层：Service -> Controller -> Repository。

- **Egg.js**：
    - 严格遵循目录约定 (`app/controller`, `app/service`)。
    - 如果项目是 TS，则写 TS；如果是 JS，则保持 CommonJS (`module.exports`) 风格。

## 🛠 常用命令 (Commands)
# (请根据当前项目实际情况取消注释)
# - run: npm run dev
# - build: npm run build
# - test: npm run test
# - lint: npm run lint

## 📝 Git & 工作流
- **提交格式**：`feat(模块): 描述` 或 `fix(模块): 描述`。
- **自我审查**：生成的代码必须检查缩进、分号、引号风格是否与周围代码一致。

## 🤖 行为准则 (Behavior Guidelines)
- **语言**：**强制使用中文回复**。无论用户输入何种语言，解释和说明都必须使用中文。
- **分析步骤**：在写代码前，先自问："这是在维护老文件，还是在写新功能？"
- **技术栈检查**：
    - **Vue**：检查 `package.json` 是 v2 还是 v3。检查文件是 Options API 还是 `<script setup>`。
    - **React**：检查是 Class 组件还是函数组件。
    - **Egg.js**：检查项目是 TypeScript (`.ts`) 还是 JavaScript (`.js`)。