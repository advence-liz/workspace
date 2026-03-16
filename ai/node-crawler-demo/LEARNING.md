# 爬虫学习指南

## 📚 学习路径

### 第一阶段：基础知识

#### 1. HTTP 协议基础
- **请求方法**: GET, POST, PUT, DELETE
- **请求头**: User-Agent, Cookie, Referer
- **响应状态码**: 200, 301, 404, 500
- **Cookie 和 Session**: 会话管理

#### 2. HTML 结构
- **DOM 树**: 文档对象模型
- **CSS 选择器**: id, class, 标签, 属性选择器
- **常用标签**: div, span, a, p, h1-h6

### 第二阶段：爬虫技术

#### 1. 基础爬虫 (axios)
```javascript
// 发送 HTTP 请求
const response = await axios.get(url, {
  headers: { 'User-Agent': '...' }
});
```

**适用场景**:
- 静态网页
- 服务端渲染的页面
- API 接口

#### 2. HTML 解析 (Cheerio)
```javascript
// 解析 HTML
const $ = cheerio.load(html);
const title = $('h1.title').text();
```

**核心技能**:
- CSS 选择器
- DOM 遍历
- 数据提取

#### 3. 动态网页 (Puppeteer)
```javascript
// 启动浏览器
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto(url);
```

**适用场景**:
- SPA (单页应用)
- JavaScript 渲染的内容
- 需要登录的网站
- 需要模拟用户操作

#### 4. 并发控制
```javascript
// 限制并发数
const limit = pLimit(3);
const tasks = urls.map(url => limit(() => crawl(url)));
await Promise.all(tasks);
```

**重要概念**:
- 并发 vs 并行
- 请求频率控制
- 资源管理

### 第三阶段：进阶技术

#### 1. 反爬虫对策
- **User-Agent 轮换**: 模拟不同浏览器
- **IP 代理池**: 避免 IP 被封
- **请求延迟**: 模拟人类行为
- **验证码处理**: OCR 或第三方服务
- **Cookie 管理**: 保持会话

#### 2. 数据处理
- **数据清洗**: 去除无效数据
- **数据验证**: 确保数据完整性
- **数据存储**: JSON, CSV, 数据库
- **数据去重**: 避免重复抓取

#### 3. 错误处理
- **超时处理**: 设置合理超时时间
- **重试机制**: 指数退避策略
- **异常捕获**: try-catch
- **日志记录**: 便于调试

#### 4. 性能优化
- **并发控制**: 提高效率
- **缓存机制**: 避免重复请求
- **增量抓取**: 只抓取新数据
- **断点续传**: 支持中断恢复

## 🎯 实战项目建议

### 初级项目
1. **静态博客爬虫**: 爬取博客文章标题和内容
2. **图片下载器**: 批量下载网站图片
3. **RSS 订阅器**: 解析 RSS feed

### 中级项目
1. **电商价格监控**: 监控商品价格变化
2. **新闻聚合器**: 从多个新闻网站抓取内容
3. **招聘信息爬虫**: 爬取招聘网站职位信息

### 高级项目
1. **社交媒体分析**: 爬取并分析社交媒体数据
2. **搜索引擎**: 构建简单的搜索引擎
3. **数据可视化**: 爬取数据并生成可视化报告

## 📖 推荐资源

### 文档
- [axios 官方文档](https://axios-http.com/)
- [Cheerio 文档](https://cheerio.js.org/)
- [Puppeteer 文档](https://pptr.dev/)

### 工具
- **Chrome DevTools**: 分析网页结构
- **Postman**: 测试 API 接口
- **JSONView**: 格式化 JSON 数据

### 学习网站
- [MDN Web Docs](https://developer.mozilla.org/)
- [Node.js 官方文档](https://nodejs.org/)

## ⚠️ 法律和道德规范

### 合法使用
1. **遵守 robots.txt**: 尊重网站的爬虫规则
2. **控制频率**: 不要对服务器造成压力
3. **版权意识**: 尊重内容版权
4. **隐私保护**: 不抓取个人隐私数据

### robots.txt 示例
```
User-agent: *
Disallow: /admin/
Disallow: /private/
Allow: /public/
```

### 最佳实践
- 添加适当的延迟
- 使用合理的 User-Agent
- 遵守网站服务条款
- 不要用于商业目的（除非获得授权）

## 🔧 调试技巧

### 1. 使用 Chrome DevTools
- **Network 面板**: 查看请求和响应
- **Elements 面板**: 查看 HTML 结构
- **Console 面板**: 测试 JavaScript

### 2. 打印调试信息
```javascript
console.log('请求 URL:', url);
console.log('响应状态:', response.status);
console.log('数据:', data);
```

### 3. 使用断点
```javascript
debugger; // 在此处暂停
```

### 4. 保存中间结果
```javascript
await saveToJson('debug.json', data);
```

## 💡 常见问题

### Q1: 为什么爬取的内容是空的？
A: 可能是动态渲染的内容，需要使用 Puppeteer。

### Q2: 如何处理反爬虫？
A: 使用代理、轮换 User-Agent、添加延迟。

### Q3: 如何提高爬取速度？
A: 使用并发控制、缓存机制、增量抓取。

### Q4: 如何处理验证码？
A: 使用 OCR 库或第三方验证码识别服务。

### Q5: 如何存储大量数据？
A: 使用数据库（MongoDB, MySQL）或文件系统。

## 🚀 下一步

1. **完成所有示例**: 理解每个示例的原理
2. **修改示例代码**: 尝试爬取不同的网站
3. **开发自己的项目**: 应用所学知识
4. **学习更多技术**: 分布式爬虫、大数据处理

祝你学习愉快！🎉
