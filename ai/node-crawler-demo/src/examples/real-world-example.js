/**
 * 实战示例：爬取新闻网站
 * 综合运用前面学到的技术
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import pLimit from 'p-limit';
import {
  sleep,
  getRandomUserAgent,
  cleanText,
  saveToJson,
  createProgressBar,
  RateLimiter,
  Logger,
} from '../utils/helpers.js';

const logger = new Logger('[新闻爬虫] ');

/**
 * 新闻爬虫类
 */
class NewsCrawler {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || '';
    this.concurrency = options.concurrency || 3;
    this.rateLimiter = new RateLimiter(5, 1000); // 每秒最多 5 个请求
    this.results = [];
  }

  /**
   * 发送 HTTP 请求
   */
  async fetch(url) {
    await this.rateLimiter.acquire();

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': getRandomUserAgent(),
        },
        timeout: 15000,
      });
      return response.data;
    } catch (error) {
      logger.error(`请求失败: ${url} - ${error.message}`);
      throw error;
    }
  }

  /**
   * 解析列表页
   */
  parseListPage(html) {
    const $ = cheerio.load(html);
    const articles = [];

    // 这里需要根据实际网站结构调整选择器
    // 以下是示例结构
    $('.article-item').each((index, element) => {
      const $item = $(element);

      const article = {
        title: cleanText($item.find('.title').text()),
        url: $item.find('a').attr('href'),
        summary: cleanText($item.find('.summary').text()),
        author: cleanText($item.find('.author').text()),
        publishTime: cleanText($item.find('.time').text()),
      };

      if (article.title && article.url) {
        articles.push(article);
      }
    });

    return articles;
  }

  /**
   * 解析详情页
   */
  parseDetailPage(html, url) {
    const $ = cheerio.load(html);

    return {
      title: cleanText($('h1.article-title').text()),
      content: cleanText($('.article-content').text()),
      author: cleanText($('.author-name').text()),
      publishTime: cleanText($('.publish-time').text()),
      tags: $('.tag')
        .map((i, el) => $(el).text().trim())
        .get(),
      url,
    };
  }

  /**
   * 爬取列表页
   */
  async crawlListPage(url) {
    logger.info(`爬取列表页: ${url}`);

    try {
      const html = await this.fetch(url);
      const articles = this.parseListPage(html);
      logger.success(`找到 ${articles.length} 篇文章`);
      return articles;
    } catch (error) {
      logger.error(`列表页爬取失败: ${error.message}`);
      return [];
    }
  }

  /**
   * 爬取详情页
   */
  async crawlDetailPage(url) {
    logger.info(`爬取详情页: ${url}`);

    try {
      const html = await this.fetch(url);
      const article = this.parseDetailPage(html, url);
      logger.success(`文章爬取成功: ${article.title}`);
      return article;
    } catch (error) {
      logger.error(`详情页爬取失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 批量爬取文章详情
   */
  async crawlArticles(articles) {
    logger.info(`开始爬取 ${articles.length} 篇文章详情`);

    const limit = pLimit(this.concurrency);
    let completed = 0;

    const tasks = articles.map((article) =>
      limit(async () => {
        const detail = await this.crawlDetailPage(article.url);
        completed++;

        // 显示进度
        const progress = createProgressBar(completed, articles.length);
        process.stdout.write(`\r  ${progress}`);

        // 随机延迟
        await sleep(Math.random() * 1000 + 500);

        return detail;
      })
    );

    const results = await Promise.all(tasks);
    console.log('\n');

    return results.filter((r) => r !== null);
  }

  /**
   * 主爬取流程
   */
  async crawl(listUrls) {
    logger.info('开始爬取...');

    // 1. 爬取所有列表页
    const allArticles = [];
    for (const url of listUrls) {
      const articles = await this.crawlListPage(url);
      allArticles.push(...articles);
      await sleep(1000); // 列表页之间延迟
    }

    logger.success(`共找到 ${allArticles.length} 篇文章`);

    // 2. 爬取文章详情
    const details = await this.crawlArticles(allArticles);

    // 3. 保存结果
    this.results = details;
    logger.success(`成功爬取 ${details.length} 篇文章`);

    return details;
  }

  /**
   * 保存结果
   */
  async save(filename = 'news-data.json') {
    await saveToJson(filename, {
      total: this.results.length,
      crawlTime: new Date().toISOString(),
      articles: this.results,
    });
  }
}

/**
 * 示例：爬取 Hacker News
 */
const crawlHackerNews = async () => {
  logger.info('开始爬取 Hacker News...');

  try {
    const response = await axios.get('https://news.ycombinator.com/', {
      headers: {
        'User-Agent': getRandomUserAgent(),
      },
    });

    const $ = cheerio.load(response.data);
    const stories = [];

    $('.athing').each((index, element) => {
      if (index >= 10) return false; // 只取前 10 条

      const $story = $(element);
      const $next = $story.next();

      const story = {
        rank: parseInt($story.find('.rank').text()),
        title: $story.find('.titleline > a').text().trim(),
        url: $story.find('.titleline > a').attr('href'),
        points: parseInt($next.find('.score').text()) || 0,
        author: $next.find('.hnuser').text(),
        comments: parseInt($next.find('.subtext a').last().text()) || 0,
      };

      stories.push(story);
    });

    return stories;
  } catch (error) {
    logger.error(`爬取失败: ${error.message}`);
    return [];
  }
};

/**
 * 主函数
 */
const main = async () => {
  console.log('='.repeat(60));
  console.log('实战示例：新闻爬虫');
  console.log('='.repeat(60));
  console.log();

  try {
    // 示例 1: 爬取 Hacker News
    logger.info('示例 1: 爬取 Hacker News Top Stories');
    const stories = await crawlHackerNews();

    console.log('\n📰 Hacker News Top 10:\n');
    stories.forEach((story, index) => {
      console.log(`${story.rank}. ${story.title}`);
      console.log(`   👤 ${story.author} | ⭐ ${story.points} points | 💬 ${story.comments} comments`);
      console.log(`   🔗 ${story.url}`);
      console.log();
    });

    // 保存数据
    await saveToJson('hacker-news.json', {
      crawlTime: new Date().toISOString(),
      total: stories.length,
      stories,
    });

    // 示例 2: 自定义爬虫（需要根据实际网站调整）
    console.log('='.repeat(60));
    logger.info('示例 2: 自定义新闻爬虫（需要配置实际网站）');
    console.log();
    console.log('💡 提示：');
    console.log('  1. 修改 NewsCrawler 类中的选择器');
    console.log('  2. 配置目标网站 URL');
    console.log('  3. 调整并发数和请求频率');
    console.log();

    /*
    // 使用示例（取消注释并配置）
    const crawler = new NewsCrawler({
      baseUrl: 'https://example-news.com',
      concurrency: 3,
    });

    const results = await crawler.crawl([
      'https://example-news.com/page/1',
      'https://example-news.com/page/2',
    ]);

    await crawler.save('news-results.json');
    */

  } catch (error) {
    logger.error(`程序执行失败: ${error.message}`);
  }
};

main();
