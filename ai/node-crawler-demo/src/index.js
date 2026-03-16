/**
 * Node.js 爬虫学习 Demo - 主入口
 */

import { Logger } from './utils/helpers.js';

const logger = new Logger('[主程序] ');

const showMenu = () => {
  console.clear();
  console.log('='.repeat(60));
  console.log('🕷️  Node.js 爬虫学习 Demo');
  console.log('='.repeat(60));
  console.log();
  console.log('请选择要运行的示例：');
  console.log();
  console.log('  1. 基础爬虫 (axios)');
  console.log('     - 学习如何发送 HTTP 请求');
  console.log('     - 了解请求头和响应处理');
  console.log('     - 实现重试机制');
  console.log();
  console.log('  2. Cheerio 爬虫 (HTML 解析)');
  console.log('     - 学习使用 Cheerio 解析 HTML');
  console.log('     - 提取结构化数据');
  console.log('     - 爬取 GitHub Trending');
  console.log();
  console.log('  3. Puppeteer 爬虫 (动态网页)');
  console.log('     - 使用无头浏览器');
  console.log('     - 处理 JavaScript 渲染的页面');
  console.log('     - 截图和模拟用户交互');
  console.log();
  console.log('  4. 并发爬虫 (批量抓取)');
  console.log('     - 并发控制策略');
  console.log('     - 批量数据抓取');
  console.log('     - 进度显示和性能优化');
  console.log();
  console.log('='.repeat(60));
  console.log();
  console.log('💡 提示：');
  console.log('  - 直接运行: npm run basic / cheerio / puppeteer / concurrent');
  console.log('  - 查看代码: src/examples/ 目录');
  console.log('  - 工具函数: src/utils/helpers.js');
  console.log();
  console.log('⚠️  注意事项：');
  console.log('  - 遵守网站的 robots.txt 规则');
  console.log('  - 控制请求频率，避免对服务器造成压力');
  console.log('  - 尊重版权，合理使用爬取的数据');
  console.log();
  console.log('='.repeat(60));
};

const main = async () => {
  showMenu();

  logger.info('程序已启动');
  logger.info('请使用 npm scripts 运行具体示例：');
  console.log();
  console.log('  npm run basic      # 基础爬虫');
  console.log('  npm run cheerio    # Cheerio 爬虫');
  console.log('  npm run puppeteer  # Puppeteer 爬虫');
  console.log('  npm run concurrent # 并发爬虫');
  console.log();
};

main();
