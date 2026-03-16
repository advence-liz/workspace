/**
 * 示例 2: Cheerio 爬虫
 * 使用 Cheerio 解析 HTML，提取结构化数据
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * 爬取并解析网页
 */
const crawlWithCheerio = async (url) => {
  try {
    console.log('🚀 开始爬取:', url);

    // 1. 获取网页内容
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    // 2. 使用 Cheerio 加载 HTML
    const $ = cheerio.load(response.data);

    // 3. 提取数据
    const pageData = {
      title: $('title').text().trim(),
      headings: [],
      links: [],
      paragraphs: [],
    };

    // 提取所有标题
    $('h1, h2, h3').each((index, element) => {
      pageData.headings.push({
        level: element.name,
        text: $(element).text().trim(),
      });
    });

    // 提取所有链接
    $('a[href]').each((index, element) => {
      const href = $(element).attr('href');
      const text = $(element).text().trim();
      if (href && text) {
        pageData.links.push({ text, href });
      }
    });

    // 提取所有段落
    $('p').each((index, element) => {
      const text = $(element).text().trim();
      if (text) {
        pageData.paragraphs.push(text);
      }
    });

    return pageData;
  } catch (error) {
    console.error('❌ 爬取失败:', error.message);
    throw error;
  }
};

/**
 * 爬取示例网站（GitHub Trending）
 */
const crawlGitHubTrending = async () => {
  const url = 'https://github.com/trending';

  try {
    console.log('🚀 爬取 GitHub Trending...\n');

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(response.data);
    const repositories = [];

    // 解析仓库列表
    $('article.Box-row').each((index, element) => {
      const $repo = $(element);

      // 提取仓库信息
      const nameElement = $repo.find('h2 a');
      const name = nameElement.text().trim().replace(/\s+/g, ' ');
      const url = 'https://github.com' + nameElement.attr('href');
      const description = $repo.find('p').text().trim();

      // 提取语言
      const language = $repo.find('[itemprop="programmingLanguage"]').text().trim();

      // 提取 stars
      const starsText = $repo.find('a[href*="/stargazers"]').text().trim();

      // 提取 forks
      const forksText = $repo.find('a[href*="/forks"]').text().trim();

      // 提取今日 stars
      const todayStars = $repo.find('span.d-inline-block.float-sm-right').text().trim();

      if (name) {
        repositories.push({
          name,
          url,
          description,
          language,
          stars: starsText,
          forks: forksText,
          todayStars,
        });
      }
    });

    return repositories;
  } catch (error) {
    console.error('❌ 爬取失败:', error.message);
    throw error;
  }
};

/**
 * 格式化输出结果
 */
const displayResults = (data) => {
  console.log('\n📊 爬取结果:\n');
  console.log('页面标题:', data.title);
  console.log('\n📌 标题列表:');
  data.headings.slice(0, 5).forEach((h, i) => {
    console.log(`  ${i + 1}. [${h.level}] ${h.text}`);
  });

  console.log('\n🔗 链接列表:');
  data.links.slice(0, 5).forEach((link, i) => {
    console.log(`  ${i + 1}. ${link.text} -> ${link.href}`);
  });

  console.log('\n📝 段落列表:');
  data.paragraphs.slice(0, 3).forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.substring(0, 100)}...`);
  });
};

/**
 * 显示 GitHub Trending 结果
 */
const displayGitHubTrending = (repositories) => {
  console.log('\n🔥 GitHub Trending 仓库:\n');
  repositories.slice(0, 10).forEach((repo, index) => {
    console.log(`${index + 1}. ${repo.name}`);
    console.log(`   📝 ${repo.description || '无描述'}`);
    console.log(`   💻 语言: ${repo.language || '未知'}`);
    console.log(`   ⭐ Stars: ${repo.stars} | 🍴 Forks: ${repo.forks}`);
    console.log(`   🚀 今日: ${repo.todayStars}`);
    console.log(`   🔗 ${repo.url}`);
    console.log();
  });
};

// 主函数
const main = async () => {
  console.log('='.repeat(60));
  console.log('Cheerio 爬虫示例');
  console.log('='.repeat(60));
  console.log();

  try {
    // 示例 1: 爬取 example.com
    console.log('📋 示例 1: 基础 HTML 解析\n');
    const exampleData = await crawlWithCheerio('https://example.com');
    displayResults(exampleData);

    // 示例 2: 爬取 GitHub Trending
    console.log('\n' + '='.repeat(60));
    console.log('📋 示例 2: 爬取 GitHub Trending\n');
    const repos = await crawlGitHubTrending();
    displayGitHubTrending(repos);

  } catch (error) {
    console.error('程序执行失败');
  }
};

main();
