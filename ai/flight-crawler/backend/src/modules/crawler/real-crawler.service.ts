import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { FlightService } from '../flight/flight.service';
import { Flight } from '../flight/entities/flight.entity';

/**
 * 真实数据爬虫服务 - 针对海南航空随心飞页面
 *
 * 页面地址: https://m.hnair.com/hnams/plusMember/ableAirlineQuery
 *
 * 页面元素分析:
 * - 出发地: 需要点击选择
 * - 到达地: 需要点击选择
 * - 日期: 需要点击选择
 * - 航班类型: 666权益卡/2666权益卡/全部航班
 * - 查询按钮: "查询航班"
 */
@Injectable()
export class RealCrawlerService {
  private readonly logger = new Logger(RealCrawlerService.name);
  private browser: puppeteer.Browser | null = null;

  constructor(private readonly flightService: FlightService) {}

  /**
   * 爬取真实航班数据
   */
  async crawlRealFlights(origin: string, dates: string[]): Promise<number> {
    this.logger.log(`🕷️ 开始爬取真实数据: ${origin}, 日期: ${dates.join(', ')}`);

    try {
      await this.initBrowser();
      const flights: Partial<Flight>[] = [];

      for (const date of dates) {
        this.logger.log(`📅 爬取日期: ${date}`);
        const dayFlights = await this.crawlFlightsByDate(origin, date);
        flights.push(...dayFlights);

        // 随机延迟，避免被封
        await this.randomDelay();
      }

      // 保存到数据库
      if (flights.length > 0) {
        await this.flightService.saveFlights(flights);
        this.logger.log(`✅ 成功保存 ${flights.length} 条航班数据`);
      } else {
        this.logger.warn('⚠️ 未获取到航班数据，请检查页面结构是否变化');
      }

      return flights.length;
    } catch (error) {
      this.logger.error('❌ 爬取失败', error);
      throw error;
    } finally {
      await this.closeBrowser();
    }
  }

  /**
   * 爬取指定日期的航班
   */
  private async crawlFlightsByDate(
    origin: string,
    date: string,
  ): Promise<Partial<Flight>[]> {
    const page = await this.browser!.newPage();
    const flights: Partial<Flight>[] = [];

    try {
      // 设置视口（模拟手机）
      await page.setViewport({ width: 375, height: 812 });

      // 设置 User-Agent
      await page.setUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      );

      // 访问页面
      this.logger.log('📄 访问页面...');
      await page.goto('https://m.hnair.com/hnams/plusMember/ableAirlineQuery', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // 等待页面加载
      await page.waitForTimeout(2000);

      // 截图调试（可选）
      await page.screenshot({ path: `./debug-${date}.png` });
      this.logger.log(`📸 截图已保存: debug-${date}.png`);

      // ========================================
      // 方法 1: 尝试查找并点击出发地输入框
      // ========================================
      try {
        // 根据页面文本"出发"查找元素
        const originSelector = 'text/出发';
        await page.waitForSelector(originSelector, { timeout: 5000 });
        await page.click(originSelector);
        this.logger.log('✅ 点击出发地选择器');

        await page.waitForTimeout(1000);

        // 输入出发地（这里需要根据实际页面调整）
        await page.keyboard.type(origin);
        await page.waitForTimeout(500);

        // 点击第一个匹配项（通常会有下拉列表）
        await page.keyboard.press('Enter');
        this.logger.log(`✅ 已选择出发地: ${origin}`);
      } catch (error) {
        this.logger.warn('⚠️ 未能操作出发地选择器，尝试其他方法');
      }

      // ========================================
      // 方法 2: 如果页面使用 API 请求，监听网络请求
      // ========================================
      const apiResponses: any[] = [];

      page.on('response', async (response) => {
        const url = response.url();

        // 监听可能包含航班数据的 API 请求
        if (url.includes('flight') || url.includes('query') || url.includes('able')) {
          try {
            const data = await response.json();
            apiResponses.push(data);
            this.logger.log(`📡 捕获到 API 响应: ${url}`);
          } catch (error) {
            // 不是 JSON 响应，忽略
          }
        }
      });

      // 点击查询按钮
      try {
        // 根据页面文本"查询航班"查找按钮
        const searchButton = 'text/查询航班';
        await page.waitForSelector(searchButton, { timeout: 5000 });
        await page.click(searchButton);
        this.logger.log('🔍 已点击查询按钮');
      } catch (error) {
        this.logger.warn('⚠️ 未找到查询按钮');
      }

      // 等待结果加载
      await page.waitForTimeout(3000);

      // ========================================
      // 方法 3: 从页面 DOM 提取数据
      // ========================================
      const flightData = await page.evaluate(() => {
        const results: any[] = [];

        // 尝试多种可能的选择器
        const selectors = [
          '.flight-item',
          '.flight-card',
          '[data-flight]',
          '.list-item',
          '.van-cell',
        ];

        for (const selector of selectors) {
          const items = document.querySelectorAll(selector);

          if (items.length > 0) {
            items.forEach((item) => {
              try {
                // 提取文本内容
                const text = item.textContent || '';

                // 尝试提取航班号（通常是 HU + 数字）
                const flightNoMatch = text.match(/HU\d+/);
                const flightNo = flightNoMatch ? flightNoMatch[0] : '';

                // 尝试提取时间（通常是 HH:MM 格式）
                const timeMatches = text.match(/(\d{2}:\d{2})/g);
                const departureTime = timeMatches && timeMatches[0] ? timeMatches[0] : '';
                const arrivalTime = timeMatches && timeMatches[1] ? timeMatches[1] : '';

                if (flightNo) {
                  results.push({
                    flightNo,
                    departureTime,
                    arrivalTime,
                    text, // 保存原始文本用于调试
                  });
                }
              } catch (error) {
                console.error('提取单个航班数据失败', error);
              }
            });

            break; // 如果找到了数据，就不再尝试其他选择器
          }
        }

        return results;
      });

      this.logger.log(`📊 从 DOM 提取到 ${flightData.length} 条数据`);

      // ========================================
      // 方法 4: 从 API 响应中提取数据
      // ========================================
      if (apiResponses.length > 0) {
        this.logger.log(`📡 从 ${apiResponses.length} 个 API 响应中提取数据`);

        for (const apiData of apiResponses) {
          // 这里需要根据实际 API 响应结构调整
          // 示例：假设响应格式为 { data: { flights: [...] } }
          if (apiData.data && Array.isArray(apiData.data.flights)) {
            apiData.data.flights.forEach((flight: any) => {
              flightData.push({
                flightNo: flight.flightNo,
                departureTime: flight.departureTime,
                arrivalTime: flight.arrivalTime,
                destination: flight.destination,
              });
            });
          }
        }
      }

      // 转换为 Flight 实体
      for (const data of flightData) {
        flights.push({
          flightNo: data.flightNo,
          origin: origin,
          destination: data.destination || '未知', // 需要从页面提取
          departureTime: this.parseDateTime(date, data.departureTime),
          arrivalTime: this.parseDateTime(date, data.arrivalTime),
          availableSeats: undefined,
          cardType: '全部',
          crawledAt: new Date(),
        });
      }

      this.logger.log(`✅ ${date} 成功提取 ${flights.length} 条航班`);
    } catch (error) {
      this.logger.error(`❌ 爬取 ${date} 失败`, error);
    } finally {
      await page.close();
    }

    return flights;
  }

  /**
   * 解析日期时间
   */
  private parseDateTime(date: string, time: string): Date {
    try {
      if (!time) return new Date(date);

      const [hours, minutes] = time.split(':').map(Number);
      const dateObj = new Date(date);
      dateObj.setHours(hours, minutes, 0, 0);
      return dateObj;
    } catch (error) {
      return new Date(date);
    }
  }

  /**
   * 随机延迟
   */
  private async randomDelay(): Promise<void> {
    const delay = Math.random() * 1500 + 500; // 500-2000ms
    await new Promise((resolve) => setTimeout(resolve, delay));
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
