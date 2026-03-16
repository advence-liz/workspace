# 爬虫调试指南

## 问题描述

根据截图分析，爬虫没有成功与页面交互：
- 出发地未选择（显示"请选择出发地"）
- 权益卡类型未选择（应该选择666或2666）
- 页面停留在初始状态

## 调试步骤

### 1. 运行测试脚本（推荐）

```bash
cd /Users/liz/liz/workspace/ai/flight-crawler
node test-single-crawl.js
```

**特点**：
- 以非无头模式运行，可以看到浏览器窗口
- 生成3张截图：初始、选择权益卡后、最终
- 打印详细的页面信息
- 浏览器保持打开30秒，方便观察

### 2. 手动测试页面

1. 用手机或浏览器访问：https://m.hnair.com/hnams/plusMember/ableAirlineQuery
2. 观察页面结构：
   - 权益卡选择器的类型（radio/checkbox/button）
   - 出发地输入框的类型
   - 查询按钮的位置

### 3. 检查页面元素

使用浏览器开发者工具：

```javascript
// 查找权益卡选项
document.querySelectorAll('*').forEach(el => {
  if (el.textContent && el.textContent.includes('666权益卡')) {
    console.log('权益卡元素:', el, el.tagName);
  }
});

// 查找出发地输入
document.querySelectorAll('input, select').forEach(el => {
  console.log('输入元素:', el.placeholder || el.textContent, el.tagName);
});
```

## 可能的问题

### 1. 页面加载时机

**问题**：页面可能使用了动态加载，元素还未渲染完成
**解决**：增加等待时间或使用 `waitForSelector`

```javascript
// 等待特定元素出现
await page.waitForSelector('包含权益卡的选择器', { timeout: 5000 });
```

### 2. 元素选择器不准确

**问题**：通过文本内容查找不够精确
**解决**：使用更具体的选择器（class、id、data属性）

```javascript
// 查看实际的HTML结构
const html = await page.content();
console.log(html);
```

### 3. 页面需要特定操作顺序

**问题**：可能需要先点击某个区域才能显示选项
**解决**：观察手动操作的流程，模拟完整的交互

### 4. 页面有防爬机制

**问题**：检测到自动化工具，隐藏或改变页面结构
**解决**：
- 使用更真实的User-Agent
- 添加随机延迟
- 模拟鼠标移动

## 修改后的代码改进

### 改进1：使用 page.evaluate 直接操作DOM

```javascript
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

**优点**：
- 在页面上下文中执行，更可靠
- 避免了跨进程通信的延迟
- 可以直接访问所有DOM元素

### 改进2：增加详细日志

```javascript
this.logger.log(`📝 页面包含 "出发地": ${pageContent.includes('出发地')}`);
this.logger.log(`📝 页面包含 "666": ${pageContent.includes('666')}`);
```

**优点**：
- 快速确认页面内容是否加载
- 判断选择器逻辑是否正确

### 改进3：分步截图

```javascript
// 初始截图
await page.screenshot({ path: './debug-init.png' });
// 操作后截图
await page.screenshot({ path: './debug-after.png' });
```

**优点**：
- 对比操作前后的变化
- 发现哪一步出了问题

## 下一步调试建议

1. **运行测试脚本**，观察浏览器窗口的实际操作
2. **查看生成的截图**，对比操作前后的变化
3. **检查控制台输出**，确认页面信息是否正确
4. **如果还是失败**，手动访问页面并记录正确的操作流程
5. **根据实际页面结构**，调整选择器逻辑

## 常见页面结构

### 情况1：Radio Button

```html
<label>
  <input type="radio" name="cardType" value="666">
  <span>666权益卡航班</span>
</label>
```

**选择方式**：
```javascript
await page.click('input[value="666"]');
```

### 情况2：下拉选择

```html
<select name="cardType">
  <option value="666">666权益卡航班</option>
</select>
```

**选择方式**：
```javascript
await page.select('select[name="cardType"]', '666');
```

### 情况3：可点击的Div

```html
<div class="card-option" data-value="666">
  666权益卡航班
</div>
```

**选择方式**：
```javascript
await page.click('.card-option[data-value="666"]');
```

## 联系方式

如果问题依然存在，请提供：
1. 测试脚本生成的3张截图
2. 控制台完整输出
3. 手动访问页面的观察结果
