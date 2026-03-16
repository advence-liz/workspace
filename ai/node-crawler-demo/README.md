# Node.js 爬虫学习 Demo

这是一个全面的 Node.js 爬虫学习项目，包含多个实用示例。

## 📦 安装依赖

```bash
npm install
```

## 🚀 运行示例

### 1. 基础爬虫（使用 axios）
```bash
npm run basic
```
演示如何使用 axios 发送 HTTP 请求，获取网页内容。

### 2. Cheerio 爬虫（HTML 解析）
```bash
npm run cheerio
```
演示如何使用 Cheerio 解析 HTML，提取结构化数据。

### 3. Puppeteer 爬虫（动态网页）
```bash
npm run puppeteer
```
演示如何使用 Puppeteer 爬取需要 JavaScript 渲染的动态网页。

### 4. 并发爬虫（批量抓取）
```bash
npm run concurrent
```
演示如何使用并发控制进行批量数据抓取。

## 📚 技术栈

- **axios**: HTTP 客户端，用于发送请求
- **cheerio**: 服务端 jQuery 实现，用于 HTML 解析
- **puppeteer**: 无头浏览器，用于爬取动态网页
- **p-limit**: 并发控制工具

## 🎯 学习路径

1. **基础爬虫** → 了解 HTTP 请求和响应
2. **Cheerio 爬虫** → 学习 HTML 解析和数据提取
3. **Puppeteer 爬虫** → 处理动态网页和 SPA 应用
4. **并发爬虫** → 提高爬取效率

## ⚠️ 注意事项

1. 遵守网站的 robots.txt 规则
2. 控制请求频率，避免对服务器造成压力
3. 尊重版权，合理使用爬取的数据
4. 某些网站可能有反爬虫机制，需要添加请求头、延迟等策略
