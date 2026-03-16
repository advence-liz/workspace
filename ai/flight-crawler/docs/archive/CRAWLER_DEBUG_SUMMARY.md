# 爬虫调试优化总结

## 📋 问题分析

根据运行截图发现，爬虫没有成功与页面交互：
- ❌ 出发地未选择（显示"请选择出发地"）
- ❌ 权益卡类型未选择
- ❌ 页面停留在初始状态

## ✅ 已完成的优化

### 1. 改进页面交互逻辑

**优化前**：使用 `page.$$()` 遍历元素，跨进程通信效率低

**优化后**：使用 `page.evaluate()` 在页面上下文中直接操作DOM

```typescript
// 新的选择方式
const clicked = await page.evaluate((target) => {
  const elements = Array.from(document.querySelectorAll('*'));
  for (const el of elements) {
    if (el.textContent.includes(target)) {
      el.click();
      return true;
    }
  }
  return false;
}, '666权益卡航班');
```

**优势**：
- ✅ 更快速、更可靠
- ✅ 避免跨进程通信延迟
- ✅ 可以直接访问所有DOM元素

### 2. 增加详细日志

新增日志输出：
```typescript
this.logger.log(`📝 页面包含 "出发地": ${pageContent.includes('出发地')}`);
this.logger.log(`📝 页面包含 "666": ${pageContent.includes('666')}`);
this.logger.log(`📝 页面包含 "2666": ${pageContent.includes('2666')}`);
```

**作用**：
- ✅ 快速确认页面内容是否加载
- ✅ 判断选择器逻辑是否正确
- ✅ 便于排查问题

### 3. 分步截图

新增截图节点：
- `{timestamp}-{origin}-{date}-{cardType}-init.png` - 初始状态
- `{timestamp}-{origin}-{date}-{cardType}-after.png` - 操作后状态

**作用**：
- ✅ 对比操作前后的变化
- ✅ 发现哪一步出了问题
- ✅ 便于分析页面结构

### 4. 统一截图目录管理

**新增目录**：`backend/debug-screenshots/`

**文件命名规则**：
```
{timestamp}-{origin}-{date}-{cardType}-{stage}.png
```

**优势**：
- ✅ 统一管理，便于查找
- ✅ 时间戳排序，便于追踪
- ✅ 避免文件散落在项目根目录
- ✅ 已添加到 .gitignore

### 5. 创建测试脚本

**新文件**：`test-single-crawl.js`

**特点**：
- ✅ 非无头模式运行，可见浏览器窗口
- ✅ 生成3张截图：初始、选择权益卡后、最终
- ✅ 打印详细的页面信息
- ✅ 浏览器保持打开30秒，方便观察

**使用方法**：
```bash
cd /Users/liz/liz/workspace/ai/flight-crawler
node test-single-crawl.js
```

## 📁 新增/修改的文件

### 新增文件
1. `test-single-crawl.js` - 测试脚本
2. `DEBUG_CRAWLER.md` - 详细调试指南
3. `backend/debug-screenshots/README.md` - 截图目录说明
4. `CRAWLER_DEBUG_SUMMARY.md` - 本文档

### 修改文件
1. `backend/src/modules/crawler/crawler.service.ts` - 核心爬虫逻辑
2. `.gitignore` - 忽略截图目录
3. `test-single-crawl.js` - 统一截图路径

## 🧪 测试步骤

### 方式1：使用测试脚本（推荐）

```bash
# 1. 安装依赖（如果还没安装）
cd backend
npm install

# 2. 运行测试脚本
cd ..
node test-single-crawl.js

# 3. 观察浏览器窗口和控制台输出

# 4. 查看生成的截图
ls -lh debug-screenshots/
```

### 方式2：运行完整爬虫

```bash
# 1. 启动后端
cd backend
npm run dev

# 2. 在另一个终端触发爬虫
curl -X POST http://localhost:3000/api/crawler/trigger

# 3. 查看后端日志和截图
tail -f logs/backend.log
ls -lh debug-screenshots/
```

## 🔍 调试检查清单

运行测试后，请检查：

- [ ] 控制台输出是否包含页面信息（has666, has2666, hasOrigin等）
- [ ] 是否生成了 `init` 和 `after` 两张截图
- [ ] `after` 截图中权益卡是否被选中
- [ ] `after` 截图中出发地是否被填写
- [ ] 浏览器窗口中能否看到实际的操作过程

## 🐛 可能的问题和解决方案

### 问题1：页面元素未找到

**现象**：日志显示 `页面包含 "666": false`

**解决**：
1. 检查页面URL是否正确
2. 增加等待时间，确保页面完全加载
3. 使用 `page.waitForSelector()` 等待特定元素

### 问题2：点击无效

**现象**：截图显示元素未被选中

**解决**：
1. 检查元素是否可点击（可能被遮挡）
2. 尝试使用更精确的选择器（class、id）
3. 模拟更真实的用户操作（鼠标移动、延迟等）

### 问题3：页面结构动态变化

**现象**：有时成功，有时失败

**解决**：
1. 增加随机延迟
2. 使用 `page.waitForFunction()` 等待特定条件
3. 添加重试机制

## 📚 相关文档

- [DEBUG_CRAWLER.md](./DEBUG_CRAWLER.md) - 详细调试指南
- [backend/debug-screenshots/README.md](./backend/debug-screenshots/README.md) - 截图目录说明
- [docs/CRAWLER_ANALYSIS.md](./docs/CRAWLER_ANALYSIS.md) - 爬虫技术分析

## 🎯 下一步建议

1. **运行测试脚本**，观察实际操作过程
2. **分析截图**，对比操作前后的变化
3. **根据实际页面结构**，调整选择器逻辑
4. **如果问题依然存在**，手动访问页面记录正确的操作流程
5. **优化选择器**，使用更精确的定位方式

## 💡 提示

- 测试脚本会显示浏览器窗口，可以直观看到操作过程
- 截图文件按时间戳命名，方便追踪和对比
- 所有截图统一保存在 `debug-screenshots/` 目录
- 定期清理旧截图，避免占用过多磁盘空间
