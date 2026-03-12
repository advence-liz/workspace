---
name: format-code
description: >
  代码格式化 Skill。对给定的代码片段进行风格整理，
  支持 javascript / typescript / json / css / html。
  用法：/format-code <language> <code>
argument-hint: "<language> <code>"
allowed-tools:
  - run_shell_command
---

# 代码格式化任务

你收到了一个代码格式化请求，参数如下：

- **语言**：$ARG0
- **代码**：
```
$ARG1
```

## 执行步骤

1. 使用工具 `run_shell_command` 检查本地是否安装了 prettier：
   ```
   npx prettier --version
   ```

2. **如果 prettier 可用**：
   - 将代码通过 stdin 传给 prettier，使用对应的 parser
   - javascript / typescript → parser: `babel` / `typescript`
   - json → parser: `json`
   - css → parser: `css`
   - html → parser: `html`
   - 命令示例（以 javascript 为例）：
     ```
     echo '<code>' | npx prettier --parser babel --single-quote --print-width 80
     ```

3. **如果 prettier 不可用**：
   - 对 JSON：使用工具对其进行 pretty-print（缩进 2 空格）
   - 其他语言：整理明显的缩进问题，去除行尾空白

## 输出要求

请以如下结构输出结果：

```
【格式化结果】
语言：<language>
方式：<prettier | 基础整理>

<格式化后的代码块>

【改动说明】
- <列出主要格式化改动>
```
