import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { FlightService } from '../flight/flight.service';
import { Flight } from '../flight/entities/flight.entity';

/**
 * 增强版爬虫服务
 * 包含详细的调试日志和错误处理
 */
@Injectable()
export class CrawlerEnhancedService {
  private readonly logger = new Logger(CrawlerEnhancedService.name);
  private browser: puppeteer.Browser | null = null;

  constructor(private readonly flightService: FlightService) {}

  /**
   * 调试模式：截图并分析页面结构
   */
  async debugPageStructure(): Promise<{
    screenshot: string;
    html: string;
    selectors: string[];
  }> {
    this.logger.log('🔍 开始调试页面结构...');

    try {
      await this.initBrowser();
      const page = await this.browser!.newPage();

      // 设置视口大小（模拟手机）
      await page.setViewport({ width: 375, height: 812 });

      // 设置 User-Agent
      await page.setUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      );

      // 访问页面
      this.logger.log('📄 正在访问页面...');
      await page.goto('https://m.hnair.com/hnams/plusMember/ableAirlineQuery', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // 等待页面加载
      await page.waitForTimeout(3000);

      // 截图
      const screenshotPath = './debug-screenshot.png';
      await page.screenshot({ path: screenshotPath, fullPage: true });
      this.logger.log(`📸 截图已保存: ${screenshotPath}`);

      // 获取页面 HTML
      const html = await page.content();

      // 查找所有可能的选择器
      const selectors = await page.evaluate(() => {
        const elements: string[] = [];

        // 查找输入框
        document.querySelectorAll('input').forEach((el, idx) => {
          elements.push(
            `input[${idx}]: placeholder="${el.placeholder}", id="${el.id}", name="${el.name}", class="${el.className}"`,
          );
        });

        // 查找选择器
        document.querySelectorAll('select').forEach((el, idx) => {
          elements.push(
            `select[${idx}]: id="${el.id}", name="${el.name}", class="${el.className}"`,
          );
        });

        // 查找按钮
        document.querySelectorAll('button').forEach((el, idx) => {
          elements.push(
            `button[${idx}]: text="${el.textContent?.trim()}", class="${el.className}"`,
          );
        });

        // 查找可点击的元素
        document.querySelectorAll('[onclick], .clickable, .btn').forEach((el, idx) => {
          elements.push(
            `clickable[${idx}]: tag="${el.tagName}", text="${el.textContent?.trim().substring(0, 30)}", class="${el.className}"`,
          );
        });

        return elements;
      });

      await page.close();

      return {
        screenshot: screenshotPath,
        html: html.substring(0, 5000), // 只返回前5000字符
        selectors,
      };
    } catch (error) {
      this.logger.error('调试失败', error);
      throw error;
    } finally {
      await this.closeBrowser();
    }
  }

  /**
   * 真实爬取航班数据（需要根据调试结果调整）
   */
  async crawlRealFlights(
    origin: string,
    destination: string,
    date: string,
  ): Promise<Partial<Flight>[]> {
    this.logger.log(
      `🕷️ 开始爬取真实数据: ${origin} → ${destination}, ${date}`,
    );

    try {
      await this.initBrowser();
      const page = await this.browser!.newPage();
      const flights: Partial<Flight>[] = [];

      // 设置视口和 User-Agent
      await page.setViewport({ width: 375, height: 812 });
      await page.setUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
      );

      // 访问页面
      this.logger.log('📄 访问页面...');
      await page.goto('https://m.hnair.com/hnams/plusMember/ableAirlineQuery', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      await page.waitForTimeout(2000);

      // ========================================
      // 📝 这里需要根据实际页面结构调整
      // ========================================

      // 示例 1: 如果有出发地输入框
      try {
        const originSelector = 'input[placeholder*="出发"]'; // 根据实际调整
        await page.waitForSelector(originSelector, { timeout: 5000 });
        await page.click(originSelector);
        await page.type(originSelector, origin);
        this.logger.log(`✅ 已输入出发地: ${origin}`);
      } catch (error) {
        this.logger.warn('⚠️ 未找到出发地输入框，请调整选择器');
      }

      // 示例 2: 如果有目的地输入框
      try {
        const destSelector = 'input[placeholder*="到达"]'; // 根据实际调整
        await page.waitForSelector(destSelector, { timeout: 5000 });
        await page.click(destSelector);
        await page.type(destSelector, destination);
        this.logger.log(`✅ 已输入目的地: ${destination}`);
      } catch (error) {
        this.logger.warn('⚠️ 未找到目的地输入框，请调整选择器');
      }

      // 示例 3: 如果有日期选择器
      try {
        const dateSelector = 'input[placeholder*="日期"]'; // 根据实际调整
        await page.waitForSelector(dateSelector, { timeout: 5000 });
        await page.click(dateSelector);
        // 这里可能需要处理日期选择器的弹窗
        this.logger.log(`✅ 已选择日期: ${date}`);
      } catch (error) {
        this.logger.warn('⚠️ 未找到日期选择器，请调整选择器');
      }

      // 示例 4: 点击查询按钮
      try {
        const searchButton = 'button:contains("查询")'; // 根据实际调整
        await page.click(searchButton);
        this.logger.log('🔍 已点击查询按钮');
      } catch (error) {
        this.logger.warn('⚠️ 未找到查询按钮，请调整选择器');
      }

      // 等待结果加载
      await page.waitForTimeout(3000);

      // 提取航班数据
      const flightData = await page.evaluate(() => {
        const results: any[] = [];

        // ========================================
        // 📝 这里需要根据实际结果页面结构调整
        // ========================================

        // 示例：查找航班列表项
        const flightItems = document.querySelectorAll('.flight-item, .flight-card, [data-flight]');

        flightItems.forEach((item) => {
          try {
            // 提取航班号（示例）
            const flightNo =
              item.querySelector('.flight-no, .flight-number')?.textContent?.trim() ||
              '';

            // 提取出发时间（示例）
            const departureTime =
              item.querySelector('.departure-time, .dep-time')?.textContent?.trim() ||
              '';

            // 提取到达时间（示例）
            const arrivalTime =
              item.querySelector('.arrival-time, .arr-time')?.textContent?.trim() ||
              '';

            // 提取余票（示例）
            const seatsText =
              item.querySelector('.seats, .available')?.textContent?.trim() || '0';
            const availableSeats = parseInt(seatsText.replace(/[^\d]/g, ''));

            if (flightNo) {
              results.push({
                flightNo,
                departureTime,
                arrivalTime,
                availableSeats,
              });
            }
          } catch (error) {
            console.error('提取单个航班数据失败', error);
          }
        });

        return results;
      });

      this.logger.log(`📊 提取到 ${flightData.length} 条航班数据`);

      // 转换为 Flight 实体
      for (const data of flightData) {
        flights.push({
          flightNo: data.flightNo,
          origin: origin,
          destination: destination,
          departureTime: this.parseDateTime(date, data.departureTime),
          arrivalTime: this.parseDateTime(date, data.arrivalTime),
          availableSeats: data.availableSeats,
          cardType: '全部',
          crawledAt: new Date(),
        });
      }

      await page.close();
      return flights;
    } catch (error) {
      this.logger.error('爬取失败', error);
      throw error;
    } finally {
      await this.closeBrowser();
    }
  }

  /**
   * 解析日期时间
   */
  private parseDateTime(date: string, time: string): Date {
    try {
      // 假设时间格式为 "08:00"
      const [hours, minutes] = time.split(':').map(Number);
      const dateObj = new Date(date);
      dateObj.setHours(hours, minutes, 0, 0);
      return dateObj;
    } catch (error) {
      return new Date();
    }
  }

  /**
   * 初始化浏览器
   */
  private async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: process.env.CRAWLER_HEADLESS !== 'false',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled',
        ],
      });
    }
  }

  /**
   * 关闭浏览器
   */
  private async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
