import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { FlightService } from '../flight/flight.service';
import { Flight } from '../flight/entities/flight.entity';

/**
 * 真实爬虫实现 - 海南航空随心飞
 *
 * 策略：
 * 1. 监听网络请求，捕获 API 调用
 * 2. 如果有 API，直接解析 API 响应
 * 3. 如果没有 API，从 DOM 提取数据
 */
@Injectable()
export class CrawlerRealImplService {
  private readonly logger = new Logger(CrawlerRealImplService.name);
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
        this.logger.log(`✅ 成功保存 ${flights.length} 条真实航班数据`);
      } else {
        this.logger.warn('⚠️ 未获取到航班数据');
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
    const apiResponses: any[] = [];

    try {
      // 设置视口（模拟手机）
      await page.setViewport({ width: 375, height: 812 });

      // 设置 User-Agent
      await page.setUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      );

      // 监听所有网络请求
      page.on('response', async (response) => {
        const url = response.url();
        const status = response.status();

        // 只关注成功的 JSON 响应
        if (status === 200 && (
          url.includes('query') ||
          url.includes('flight') ||
          url.includes('able') ||
          url.includes('api')
        )) {
          try {
            const contentType = response.headers()['content-type'] || '';
            if (contentType.includes('application/json')) {
              const data = await response.json();
              this.logger.log(`📡 捕获 API: ${url}`);
              apiResponses.push({ url, data });
            }
          } catch (error) {
            // 不是 JSON，忽略
          }
        }
      });

      // 访问页面
      this.logger.log('📄 访问页面...');
      await page.goto('https://m.hnair.com/hnams/plusMember/ableAirlineQuery', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // 等待页面加载
      await page.waitForTimeout(3000);

      // 截图调试
      await page.screenshot({
        path: `./debug-${origin}-${date}.png`,
        fullPage: true
      });
      this.logger.log(`📸 截图保存: debug-${origin}-${date}.png`);

      // 尝试选择出发地（点击"出发"文本）
      try {
        // 方法 1: 点击包含"出发"文本的元素
        const departureElements = await page.$$('div, span, button');
        for (const element of departureElements) {
          const text = await element.evaluate(el => el.textContent);
          if (text && text.includes('出发') && text.length < 10) {
            await element.click();
            this.logger.log('✅ 点击了出发地选择器');
            await page.waitForTimeout(1000);
            break;
          }
        }

        // 尝试输入出发地
        await page.keyboard.type(origin);
        await page.waitForTimeout(500);

        // 按回车或点击第一个结果
        await page.keyboard.press('Enter');
        this.logger.log(`✅ 输入出发地: ${origin}`);
        await page.waitForTimeout(1000);

      } catch (error) {
        this.logger.warn('⚠️ 选择出发地失败，继续尝试...');
      }

      // 点击查询按钮
      try {
        const allElements = await page.$$('div, span, button');
        for (const element of allElements) {
          const text = await element.evaluate(el => el.textContent);
          if (text && text.includes('查询航班')) {
            await element.click();
            this.logger.log('🔍 点击查询按钮');
            await page.waitForTimeout(3000);
            break;
          }
        }
      } catch (error) {
        this.logger.warn('⚠️ 点击查询按钮失败');
      }

      // 等待 API 响应
      await page.waitForTimeout(2000);

      // 方法 1: 从 API 响应提取数据
      if (apiResponses.length > 0) {
        this.logger.log(`📡 分析 ${apiResponses.length} 个 API 响应`);

        for (const { url, data } of apiResponses) {
          this.logger.log(`🔍 分析 API: ${url}`);

          // 尝试多种可能的数据结构
          const possibleFlights =
            data?.data?.flights ||
            data?.data?.list ||
            data?.flights ||
            data?.list ||
            data?.result?.flights ||
            data?.result?.list ||
            (Array.isArray(data?.data) ? data.data : null) ||
            (Array.isArray(data) ? data : null);

          if (possibleFlights && Array.isArray(possibleFlights)) {
            this.logger.log(`✅ 找到航班数组，长度: ${possibleFlights.length}`);

            possibleFlights.forEach((flight: any) => {
              // 打印第一个航班的结构，用于调试
              if (flights.length === 0) {
                this.logger.log(`🔍 航班数据结构示例: ${JSON.stringify(flight).substring(0, 200)}`);
              }

              try {
                flights.push({
                  flightNo: flight.flightNo || flight.flightNumber || flight.flight_no,
                  origin: flight.origin || flight.departure || origin,
                  destination: flight.destination || flight.arrival || '未知',
                  departureTime: this.parseDateTime(date, flight.departureTime || flight.depTime || flight.dep_time),
                  arrivalTime: this.parseDateTime(date, flight.arrivalTime || flight.arrTime || flight.arr_time),
                  availableSeats: parseInt(flight.seats || flight.availableSeats || '0') || undefined,
                  cardType: flight.cardType || '全部',
                  crawledAt: new Date(),
                });
              } catch (error) {
                this.logger.error('解析单个航班失败', error);
              }
            });
          }
        }
      }

      // 方法 2: 从 DOM 提取数据（备用方案）
      if (flights.length === 0) {
        this.logger.log('📊 尝试从 DOM 提取数据...');

        const domFlights = await page.evaluate(() => {
          const results: any[] = [];

          // 尝试多种可能的选择器
          const selectors = [
            '.flight-item',
            '.flight-card',
            '.list-item',
            '[class*="flight"]',
            '[class*="Flight"]',
          ];

          for (const selector of selectors) {
            const items = document.querySelectorAll(selector);

            if (items.length > 0) {
              console.log(`找到 ${items.length} 个元素，选择器: ${selector}`);

              items.forEach((item) => {
                const text = item.textContent || '';

                // 提取航班号 (HU + 数字)
                const flightNoMatch = text.match(/HU\d{4}/);
                // 提取时间 (HH:MM 格式)
                const timeMatches = text.match(/(\d{2}:\d{2})/g);

                if (flightNoMatch) {
                  results.push({
                    flightNo: flightNoMatch[0],
                    departureTime: timeMatches && timeMatches[0] ? timeMatches[0] : '',
                    arrivalTime: timeMatches && timeMatches[1] ? timeMatches[1] : '',
                    rawText: text.substring(0, 100),
                  });
                }
              });

              break; // 找到数据就停止
            }
          }

          return results;
        });

        if (domFlights.length > 0) {
          this.logger.log(`✅ 从 DOM 提取到 ${domFlights.length} 条数据`);

          domFlights.forEach((flight: any) => {
            flights.push({
              flightNo: flight.flightNo || 'UNKNOWN',
              origin: origin,
              destination: '未知', // DOM 中可能没有目的地信息
              departureTime: this.parseDateTime(date, flight.departureTime),
              arrivalTime: this.parseDateTime(date, flight.arrivalTime),
              availableSeats: undefined,
              cardType: '全部',
              crawledAt: new Date(),
            });
          });
        }
      }

      this.logger.log(`✅ ${date} 提取了 ${flights.length} 条数据`);
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

      // 处理多种时间格式
      if (time.includes('T')) {
        return new Date(time);
      }

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
    const delay = Math.random() * 1500 + 500;
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
