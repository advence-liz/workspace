import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { FlightService } from '../flight/flight.service';
import { Flight } from '../flight/entities/flight.entity';
import {
  CrawlerLog,
  CrawlerTaskType,
  CrawlerTaskStatus
} from './entities/crawler-log.entity';

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);
  private browser: puppeteer.Browser | null = null;
  private readonly screenshotDir = path.join(process.cwd(), 'debug-screenshots');

  constructor(
    private readonly flightService: FlightService,
    @InjectRepository(CrawlerLog)
    private readonly crawlerLogRepository: Repository<CrawlerLog>,
  ) {
    // 确保截图目录存在
    this.ensureScreenshotDir();
  }

  /**
   * 确保截图目录存在
   */
  private ensureScreenshotDir(): void {
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
      this.logger.log(`📁 创建截图目录: ${this.screenshotDir}`);
    }
  }

  /**
   * 启动爬虫任务 - 同时爬取666和2666权益卡航班（一次性操作）
   * @param origin 出发城市
   * @param dates 日期列表
   * @param headless 是否无头模式（默认 true）
   * @param saveToDb 是否保存到数据库（默认 true）
   * @returns 返回爬取的航班数据
   */
  async crawlFlights(
    origin: string,
    dates: string[],
    headless: boolean = true,
    saveToDb: boolean = true,
  ): Promise<{ count: number; flights: Partial<Flight>[] }> {
    this.logger.log(`开始爬取航班数据: ${origin}, 日期: ${dates.join(', ')}`);

    try {
      await this.initBrowser(headless);
      const flights: Partial<Flight>[] = [];

      // 权益卡类型：同时爬取666和2666
      const cardTypes = ['666权益卡航班', '2666权益卡航班'];

      for (const date of dates) {
        // 一次性爬取所有权益卡类型的航班
        this.logger.log(`爬取所有权益卡 - ${date}`);
        const dayFlights = await this.crawlFlightsByDate(origin, date, cardTypes);
        flights.push(...dayFlights);

        // 随机延迟，避免被封
        await this.randomDelay();
      }

      // 保存到数据库
      if (saveToDb && flights.length > 0) {
        await this.flightService.saveFlights(flights);
        this.logger.log(`成功保存 ${flights.length} 条航班数据`);
      }

      return { count: flights.length, flights };
    } catch (error) {
      this.logger.error('爬取失败', error);
      throw error;
    } finally {
      await this.closeBrowser();
    }
  }

  /**
   * 初始化浏览器
   * @param headless 是否无头模式（默认根据环境变量）
   */
  private async initBrowser(headless?: boolean): Promise<void> {
    if (!this.browser) {
      // 如果明确指定 headless 参数，使用该参数；否则使用环境变量
      const isHeadless = headless !== undefined
        ? headless
        : process.env.CRAWLER_HEADLESS !== 'false';

      this.browser = await puppeteer.launch({
        headless: isHeadless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
      });

      this.logger.log(`🌐 浏览器启动模式: ${isHeadless ? '无头模式' : '可视化模式'}`);
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

  /**
   * 爬取指定日期和权益卡类型的航班
   * @param cardTypes 权益卡类型（字符串或字符串数组）
   */
  private async crawlFlightsByDate(
    origin: string,
    date: string,
    cardTypes: string | string[],
  ): Promise<Partial<Flight>[]> {
    // 统一处理为数组
    const cardTypeArray = Array.isArray(cardTypes) ? cardTypes : [cardTypes];
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
      const cardTypeLabel = cardTypeArray.join('+');
      this.logger.log(`📄 访问页面: ${origin} - ${date} - ${cardTypeLabel}`);
      await page.goto('https://m.hnair.com/hnams/plusMember/ableAirlineQuery', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // 等待页面加载
      await page.waitForTimeout(3000);

      // 先截图看看初始状态
      const timestamp = new Date().getTime();
      const cardTypeShort = cardTypeArray.map(ct => ct.replace('权益卡航班', '')).join('-');
      const screenshotInitPath = path.join(
        this.screenshotDir,
        `${timestamp}-${origin}-${date}-${cardTypeShort}-init.png`
      );
      await page.screenshot({ path: screenshotInitPath, fullPage: true });
      this.logger.log(`📸 初始截图: ${screenshotInitPath}`);

      // 打印页面HTML结构用于调试
      const pageContent = await page.content();
      this.logger.log(`📝 页面包含 "出发地": ${pageContent.includes('出发地')}`);
      this.logger.log(`📝 页面包含 "666": ${pageContent.includes('666')}`);
      this.logger.log(`📝 页面包含 "2666": ${pageContent.includes('2666')}`);

      // 分析页面上的关键元素
      const elementsInfo = await page.evaluate(() => {
        const info: any = {
          searchItems: [],
          depBox: null,
          queryBtn: null,
        };

        // 查找权益卡选项
        document.querySelectorAll('.search-item').forEach((item, idx) => {
          info.searchItems.push({
            index: idx,
            text: item.textContent?.trim(),
            className: item.className,
          });
        });

        // 查找出发地框
        const depBox = document.querySelector('.dep-box');
        if (depBox) {
          info.depBox = {
            text: depBox.textContent?.trim(),
            className: depBox.className,
          };
        }

        // 查找查询按钮
        const queryBtn = document.querySelector('.query-btn');
        if (queryBtn) {
          info.queryBtn = {
            text: queryBtn.textContent?.trim(),
            className: queryBtn.className,
          };
        }

        return info;
      });
      this.logger.log(`🔍 页面元素分析: ${JSON.stringify(elementsInfo, null, 2)}`);

      // 选择所有权益卡类型（一次性选择）
      this.logger.log(`🎫 开始选择权益卡: ${cardTypeLabel}`);
      let allCardsSelected = true;
      for (const cardType of cardTypeArray) {
        const cardTypeSelected = await this.selectCardType(page, cardType);
        if (!cardTypeSelected) {
          this.logger.warn(`⚠️ 权益卡选择失败: ${cardType}`);
          allCardsSelected = false;
          break;
        }
        this.logger.log(`✅ 权益卡选择成功: ${cardType}`);
      }

      if (!allCardsSelected) {
        this.logger.warn(`⚠️ 部分权益卡选择失败，跳过本次查询`);
        // 截图记录失败状态
        const failPath = path.join(
          this.screenshotDir,
          `${timestamp}-${origin}-${date}-${cardTypeShort}-card-fail.png`
        );
        await page.screenshot({ path: failPath, fullPage: true });
        this.logger.log(`📸 权益卡选择失败截图: ${failPath}`);
        return flights;
      }
      this.logger.log(`✅ 所有权益卡选择完成: ${cardTypeLabel}`);

      // 等待页面响应
      await page.waitForTimeout(1000);

      // 截图查看权益卡选择后的状态
      const cardSelectedPath = path.join(
        this.screenshotDir,
        `${timestamp}-${origin}-${date}-${cardTypeShort}-card-selected.png`
      );
      await page.screenshot({ path: cardSelectedPath, fullPage: true });
      this.logger.log(`📸 权益卡选择后截图: ${cardSelectedPath}`);

      // 选择出发地
      this.logger.log(`🛫 开始选择出发地: ${origin}`);
      const originSelected = await this.selectOrigin(page, origin);
      if (!originSelected) {
        this.logger.warn(`⚠️ 出发地选择失败，跳过: ${origin}`);
        // 截图记录失败状态
        const failPath = path.join(
          this.screenshotDir,
          `${timestamp}-${origin}-${date}-${cardTypeShort}-origin-fail.png`
        );
        await page.screenshot({ path: failPath, fullPage: true });
        this.logger.log(`📸 出发地选择失败截图: ${failPath}`);
        return flights;
      }
      this.logger.log(`✅ 出发地选择成功: ${origin}`);

      // 等待页面响应
      await page.waitForTimeout(1000);

      // 选择日期
      this.logger.log(`📅 开始选择日期: ${date}`);
      const dateSelected = await this.selectDate(page, date);
      if (!dateSelected) {
        this.logger.warn(`⚠️ 日期选择失败，跳过: ${date}`);
        // 截图记录失败状态
        const failPath = path.join(
          this.screenshotDir,
          `${timestamp}-${origin}-${date}-${cardTypeShort}-date-fail.png`
        );
        await page.screenshot({ path: failPath, fullPage: true });
        this.logger.log(`📸 日期选择失败截图: ${failPath}`);
        return flights;
      }
      this.logger.log(`✅ 日期选择成功: ${date}`);

      // 等待页面响应
      await page.waitForTimeout(1000);

      // 截图查看操作后的状态
      const screenshotPath = path.join(
        this.screenshotDir,
        `${timestamp}-${origin}-${date}-${cardTypeShort}-after.png`
      );
      await page.screenshot({ path: screenshotPath, fullPage: true });
      this.logger.log(`📸 操作后截图: ${screenshotPath}`);

      // 点击查询按钮
      this.logger.log(`🔍 开始点击查询按钮`);
      const queryClicked = await this.clickSearchButton(page);
      if (!queryClicked) {
        this.logger.warn('⚠️ 查询按钮点击失败，跳过');
        // 截图记录失败状态
        const failPath = path.join(
          this.screenshotDir,
          `${timestamp}-${origin}-${date}-${cardTypeShort}-query-fail.png`
        );
        await page.screenshot({ path: failPath, fullPage: true });
        this.logger.log(`📸 查询按钮点击失败截图: ${failPath}`);
        return flights;
      }
      this.logger.log(`✅ 查询按钮点击成功`);

      // 智能等待：等待数据加载完成或确认无数据
      this.logger.log('⏳ 智能等待页面加载...');

      // 等待3秒让页面加载
      await page.waitForTimeout(3000);

      // 检查页面状态（通过文本内容判断）
      const pageState = await page.evaluate(() => {
        const body = document.body;
        const bodyText = body.textContent || '';

        // 检查是否包含"暂时没有可预订的航班"等无数据提示
        const hasNoDataText = bodyText.includes('暂时没有可预订的航班') ||
                              bodyText.includes('没有找到') ||
                              bodyText.includes('暂无数据');

        // 检查是否有航班列表容器，且内容不为空
        const flightListElements = document.querySelectorAll('.flight-list > *, .list-item');
        const hasFlightData = flightListElements.length > 0;

        return {
          hasFlightData,
          hasNoDataText,
          bodyTextSample: bodyText.substring(0, 300),
          bodyLength: bodyText.length,
          flightListCount: flightListElements.length
        };
      });

      this.logger.log(`📊 页面状态: ${JSON.stringify(pageState)}`);

      if (pageState.hasNoDataText) {
        this.logger.log('ℹ️ 确认无数据：页面提示暂无可预订航班');
      } else if (pageState.hasFlightData) {
        this.logger.log(`✅ 检测到航班数据：${pageState.flightListCount} 个航班元素`);
      } else {
        this.logger.warn('⚠️ 页面状态未知，继续尝试提取数据');
      }

      // 截图查看查询后的结果页面
      const resultPath = path.join(
        this.screenshotDir,
        `${timestamp}-${origin}-${date}-${cardTypeShort}-result.png`
      );
      await page.screenshot({ path: resultPath, fullPage: true });
      this.logger.log(`📸 查询结果截图: ${resultPath}`);

      // 从 API 响应提取数据
      if (apiResponses.length > 0) {
        this.logger.log(`📡 分析 ${apiResponses.length} 个 API 响应`);

        for (const { url, data } of apiResponses) {
          // 尝试多种可能的数据结构
          const possibleFlights =
            data?.data?.flights ||
            data?.data?.list ||
            data?.flights ||
            data?.list ||
            (Array.isArray(data?.data) ? data.data : null) ||
            (Array.isArray(data) ? data : null);

          if (possibleFlights && Array.isArray(possibleFlights)) {
            this.logger.log(`✅ 找到 ${possibleFlights.length} 条航班`);

            possibleFlights.forEach((flight: any) => {
              try {
                // 只保存有明确目的地的航班（有航线就代表可以特价购买）
                const destination = flight.destination || flight.arrCity || flight.arrival;
                if (destination && destination !== '未知' && destination !== origin) {
                  // 尝试从 API 响应中识别权益卡类型，如果无法识别则标记为"全部"
                  const detectedCardType = flight.cardType ||
                    (cardTypeArray.length === 1 ? cardTypeArray[0] : '全部');

                  // 解析时间：支持多种格式
                  const parseTime = (timeValue: any, fallbackDate: string): Date => {
                    if (!timeValue) return new Date(fallbackDate);

                    // 如果已经是 Date 对象
                    if (timeValue instanceof Date) return timeValue;

                    // 如果是时间戳（数字）
                    if (typeof timeValue === 'number') return new Date(timeValue);

                    // 如果是字符串
                    if (typeof timeValue === 'string') {
                      // 格式1: ISO 格式 "2026-03-16T08:00:00"
                      if (timeValue.includes('T') || timeValue.includes(' ')) {
                        const parsed = new Date(timeValue);
                        if (!isNaN(parsed.getTime())) return parsed;
                      }

                      // 格式2: 仅时间 "08:00" 或 "08:00:00"
                      if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeValue)) {
                        return new Date(`${fallbackDate} ${timeValue}`);
                      }

                      // 格式3: 尝试直接解析
                      const parsed = new Date(timeValue);
                      if (!isNaN(parsed.getTime())) return parsed;
                    }

                    // 解析失败，返回当天日期
                    return new Date(fallbackDate);
                  };

                  const depTime = parseTime(
                    flight.departureTime || flight.depTime || flight.takeoffTime,
                    date
                  );
                  let arrTime = parseTime(
                    flight.arrivalTime || flight.arrTime || flight.landingTime,
                    date
                  );

                  // 如果到达时间早于起飞时间，说明是第二天到达
                  if (arrTime < depTime) {
                    arrTime = new Date(arrTime.getTime() + 24 * 60 * 60 * 1000);
                  }

                  flights.push({
                    flightNo: flight.flightNo || flight.flightNumber || flight.flightNum || 'UNKNOWN',
                    origin: flight.origin || flight.depCity || origin,
                    destination: destination,
                    departureTime: depTime,
                    arrivalTime: arrTime,
                    availableSeats: parseInt(flight.seats || flight.seatCount || '0') || undefined,
                    cardType: detectedCardType,
                    crawledAt: new Date(),
                  });
                  this.logger.debug(`✅ 航班: ${flight.origin || origin} → ${destination}, ${depTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}-${arrTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}, 权益卡: ${detectedCardType}`);
                }
              } catch (error) {
                this.logger.error('解析航班失败', error);
              }
            });
          }
        }
      }

      // 如果 API 没有数据，尝试从 DOM 提取
      if (flights.length === 0) {
        this.logger.log('📊 尝试从 DOM 提取...');

        const domFlights = await page.evaluate(() => {
          const results: any[] = [];
          const debugInfo: any[] = [];
          const selectors = ['.flight-item', '.list-item', '[class*="flight"]'];

          for (const selector of selectors) {
            const items = document.querySelectorAll(selector);
            if (items.length > 0) {
              items.forEach((item, index) => {
                const text = item.textContent || '';

                // 调试：收集前3个航班项的 HTML 结构
                if (index < 3) {
                  const debug = {
                    index: index + 1,
                    html: item.innerHTML,
                    text: text,
                    children: [] as any[]
                  };

                  // 收集所有子元素信息
                  const allElements = item.querySelectorAll('*');
                  allElements.forEach((el: any, i: number) => {
                    if (el.textContent && el.textContent.trim().length < 50) {
                      debug.children.push({
                        tag: el.tagName,
                        class: el.className,
                        text: el.textContent.trim()
                      });
                    }
                  });

                  debugInfo.push(debug);
                }

                // 尝试通过 DOM 结构直接提取出发地和目的地
                let originFromDom = null;
                let destFromDom = null;

                // 方法1: 使用用户指定的 class 选择器直接提取（优先）
                const depElem = item.querySelector('.seg-item.seg-dep');
                const arrElem = item.querySelector('.seg-item.seg-arr');

                if (depElem) {
                  originFromDom = depElem.textContent?.trim() || null;
                }

                if (arrElem) {
                  destFromDom = arrElem.textContent?.trim() || null;
                }

                // 方法2: 如果方法1失败，查找包含箭头的元素作为备用
                if (!originFromDom || !destFromDom) {
                  const routeSelectors = [
                    '.route', '.city', '.airport', '.line',
                    '[class*="route"]', '[class*="city"]', '[class*="airport"]', '[class*="line"]'
                  ];

                  for (const routeSelector of routeSelectors) {
                    const routeElem = item.querySelector(routeSelector);
                    if (routeElem) {
                      const routeText = routeElem.textContent || '';
                      // 使用更宽松的箭头匹配
                      const arrowMatch = routeText.match(/([^→\s]+)\s*→\s*([^→\s]+)/);
                      if (arrowMatch) {
                        originFromDom = originFromDom || arrowMatch[1].trim();
                        destFromDom = destFromDom || arrowMatch[2].trim();
                        break;
                      }
                    }
                  }
                }

                // 如果 DOM 提取成功，优先使用 DOM 结果
                const originAirportFromDom = originFromDom;
                const destinationFromDom = destFromDom;

                // 尝试从父级元素或前置标题中查找权益卡类型
                let contextCardType = null;

                // 方法1: 查找父级元素中的权益卡标识
                let parent = item.parentElement;
                let depth = 0;
                while (parent && depth < 5) {
                  const parentText = parent.textContent || '';
                  if (parentText.includes('2666权益卡') || parentText.includes('2666')) {
                    contextCardType = '2666权益卡航班';
                    break;
                  } else if (parentText.includes('666权益卡') || parentText.includes('666')) {
                    contextCardType = '666权益卡航班';
                    break;
                  }
                  parent = parent.parentElement;
                  depth++;
                }

                // 方法2: 查找前面的兄弟元素（可能是分组标题）
                if (!contextCardType) {
                  let sibling = item.previousElementSibling;
                  let siblingDepth = 0;
                  while (sibling && siblingDepth < 3) {
                    const siblingText = sibling.textContent || '';
                    if (siblingText.includes('2666权益卡') || siblingText.includes('2666')) {
                      contextCardType = '2666权益卡航班';
                      break;
                    } else if (siblingText.includes('666权益卡') || siblingText.includes('666')) {
                      contextCardType = '666权益卡航班';
                      break;
                    }
                    sibling = sibling.previousElementSibling;
                    siblingDepth++;
                  }
                }
                // 支持多种航班号格式：HU(海南航空)、JD(首都航空)、PN(西部航空) 等
                const flightNo = text.match(/[A-Z]{2}\d{4}/)?.[0];

                // 不再提取价格信息

                // 提取出发地和目的地
                // 优先级：DOM元素提取 > 箭头格式 > 文本解析
                let originAirport = originAirportFromDom;
                let destination = destinationFromDom || '待解析';

                // 如果 DOM 提取失败，尝试箭头格式
                if (!originAirport) {
                  const arrowMatch = text.match(/([^\s→¥]+)\s*→\s*([^\s¥]+)/);
                  if (arrowMatch) {
                    originAirport = arrowMatch[1].trim();
                    destination = arrowMatch[2].trim();
                  } else {
                  // 方法2（兜底）: 文本格式 "深圳北京首都新海航" -> origin="深圳", destination="北京首都新"
                  // 航司标识（用于定位航线信息的结束位置）
                  const airlineKeywords = ['海航', '国航', '东航', '南航', '川航', '厦航'];
                  let airlineIndex = -1;
                  for (const keyword of airlineKeywords) {
                    const idx = text.indexOf(keyword);
                    if (idx !== -1) {
                      airlineIndex = idx;
                      break;
                    }
                  }

                  if (airlineIndex !== -1) {
                    // 提取航线部分（航司之前的文本）
                    const routeText = text.substring(0, airlineIndex);

                    // 机场标识正则
                    const airportPattern = /(首都|大兴|浦东|虹桥|白云|宝安|天河|萧山|流亭|周水子|江北|双流|天府|咸阳|长水|黄花|凤凰|新|机场)/g;
                    const matches = Array.from(routeText.matchAll(airportPattern));

                    if (matches.length >= 2) {
                      // 有2个或以上机场标识：第1个是出发地，最后1个是目的地
                      const firstMatch = matches[0];
                      const lastMatch = matches[matches.length - 1];

                      // 提取出发地
                      const originEndIndex = firstMatch.index! + firstMatch[0].length;
                      const beforeOrigin = routeText.substring(0, firstMatch.index!);
                      const originCity = beforeOrigin.match(/([\\u4e00-\\u9fa5]{2,4})$/)?.[1] || '';
                      originAirport = originCity + firstMatch[0];

                      // 提取目的地
                      const beforeDest = routeText.substring(0, lastMatch.index!);
                      // 找到最后一个机场标识之前的城市名
                      const textBeforeDest = beforeDest.substring(originEndIndex);
                      const destCity = textBeforeDest.match(/([\\u4e00-\\u9fa5]{2,4})$/)?.[1] || '';
                      destination = destCity + lastMatch[0];
                    } else if (matches.length === 1) {
                      // 只有1个机场标识：目的地有标识，出发地没有
                      const match = matches[0];
                      const beforeAirport = routeText.substring(0, match.index!);

                      // 提取目的地城市名（机场标识之前的2-4个汉字）
                      const destCity = beforeAirport.match(/([\\u4e00-\\u9fa5]{2,4})$/)?.[1] || '';
                      destination = destCity + match[0];

                      // 提取出发地（在目的地城市之前的2-4个汉字）
                      const beforeDest = beforeAirport.substring(0, beforeAirport.length - destCity.length);
                      originAirport = beforeDest.match(/([\\u4e00-\\u9fa5]{2,4})$/)?.[1] || '';
                    }
                  }
                  }
                }

                // 提取时间信息
                // 格式示例: "08:00" 或 "08:00-10:30" 或 "起飞08:00 到达10:30"
                let departureTime = null;
                let arrivalTime = null;

                // 方法1: 匹配 "HH:MM-HH:MM" 或 "HH:MM - HH:MM"
                const timeMatch1 = text.match(/(\d{2}:\d{2})\s*[-~]\s*(\d{2}:\d{2})/);
                if (timeMatch1) {
                  departureTime = timeMatch1[1];
                  arrivalTime = timeMatch1[2];
                }

                // 方法2: 匹配 "起飞 HH:MM" 和 "到达 HH:MM"
                if (!departureTime) {
                  const depMatch = text.match(/起飞[：:]*\s*(\d{2}:\d{2})/);
                  if (depMatch) departureTime = depMatch[1];
                }
                if (!arrivalTime) {
                  const arrMatch = text.match(/到达[：:]*\s*(\d{2}:\d{2})/);
                  if (arrMatch) arrivalTime = arrMatch[1];
                }

                // 方法3: 匹配任意 HH:MM 格式（取前两个）
                if (!departureTime || !arrivalTime) {
                  const allTimes = text.match(/\d{2}:\d{2}/g);
                  if (allTimes && allTimes.length >= 2) {
                    departureTime = departureTime || allTimes[0];
                    arrivalTime = arrivalTime || allTimes[1];
                  }
                }

                // 提取权益卡类型
                // 优先级：元素自身文本 > 上下文（父级或兄弟元素）
                let cardType = null;

                // 方法1: 从元素自身文本提取
                // 页面格式分析：
                // - "6662666" 表示同时适用两种权益卡
                // - 单独的 "666" 或 "2666" 表示只适用一种

                // 检查是否包含 "6662666" 这种连续模式
                if (text.includes('6662666')) {
                  // 同时适用两种权益卡
                  cardType = '666权益卡航班,2666权益卡航班';
                } else if (text.includes('2666权益卡') || text.includes('2666')) {
                  cardType = '2666权益卡航班';
                } else if (text.includes('666权益卡') || text.includes('666')) {
                  cardType = '666权益卡航班';
                }

                // 方法2: 使用上下文中的权益卡类型
                if (!cardType && contextCardType) {
                  cardType = contextCardType;
                }

                if (flightNo) {
                  results.push({
                    flightNo,
                    originAirport,  // 新增出发地完整机场名称
                    destination: destination || '待解析',
                    departureTime,
                    arrivalTime,
                    cardType,  // 新增权益卡类型字段
                    text: text.substring(0, 150)  // 增加文本长度以便调试
                  });
                }
              });
              break;
            }
          }
          return { results, debugInfo };
        });

        // 输出调试信息
        if (domFlights.debugInfo && domFlights.debugInfo.length > 0) {
          this.logger.log('=== DOM 结构调试信息 ===');
          domFlights.debugInfo.forEach((info: any) => {
            this.logger.log(`航班项 ${info.index}:`);
            this.logger.log(`  文本: ${info.text.substring(0, 100)}`);
            this.logger.log(`  子元素数: ${info.children.length}`);
            info.children.slice(0, 10).forEach((child: any) => {
              this.logger.log(`    ${child.tag}.${child.class}: "${child.text}"`);
            });
          });
        }

        const domFlightsList = domFlights.results || domFlights;
        if (domFlightsList.length > 0) {
          this.logger.log(`✅ DOM 提取 ${domFlightsList.length} 条`);
          domFlightsList.forEach((f: any) => {
            // 记录提取的原始数据用于调试
            this.logger.debug(`DOM数据: ${JSON.stringify(f)}`);

            // DOM提取的数据也需要有明确目的地
            if (f.destination && f.destination !== '待解析' && f.destination !== origin) {
              // 优先使用从 DOM 提取的权益卡类型
              // 如果 DOM 中没有权益卡标识，则根据选择的权益卡数量判断
              let detectedCardType = f.cardType;
              if (!detectedCardType) {
                detectedCardType = cardTypeArray.length === 1 ? cardTypeArray[0] : '全部';
              }

              // 解析时间：将 "HH:MM" 格式与日期组合
              const parseDatetime = (dateStr: string, timeStr: string | null, isDeparture: boolean, depTime?: Date): Date => {
                if (timeStr && /^\d{2}:\d{2}$/.test(timeStr)) {
                  // 组合日期和时间：YYYY-MM-DD HH:MM
                  const datetime = new Date(`${dateStr} ${timeStr}`);

                  // 如果是到达时间，且到达时间早于起飞时间，说明是第二天到达
                  if (!isDeparture && depTime && datetime < depTime) {
                    datetime.setDate(datetime.getDate() + 1);
                  }

                  return datetime;
                }
                // 如果没有时间，返回当天 00:00
                return new Date(dateStr);
              };

              const depTime = parseDatetime(date, f.departureTime, true);
              const arrTime = parseDatetime(date, f.arrivalTime, false, depTime);

              flights.push({
                flightNo: f.flightNo || 'UNKNOWN',
                origin: f.originAirport || origin,  // 优先使用提取的完整机场名称
                destination: f.destination,
                departureTime: depTime,
                arrivalTime: arrTime,
                cardType: detectedCardType,
                crawledAt: new Date(),
              });

              this.logger.debug(`✅ DOM航班: ${f.flightNo} ${origin} → ${f.destination}, ${depTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}-${arrTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}, 权益卡: ${detectedCardType}`);
            } else {
              // 记录被过滤的数据
              this.logger.warn(
                `⚠️ 数据被过滤: destination=${f.destination}, origin=${origin}, text=${f.text}`
              );
            }
          });
        }
      }

      // 最终截图 - 显示提取数据的状态
      const finalPath = path.join(
        this.screenshotDir,
        `${timestamp}-${origin}-${date}-${cardTypeShort}-final.png`
      );
      await page.screenshot({ path: finalPath, fullPage: true });
      this.logger.log(`📸 最终状态截图: ${finalPath}`);

      this.logger.log(`${flights.length > 0 ? '✅' : '⚠️'} ${date} 获取 ${flights.length} 条数据`);
    } catch (error) {
      this.logger.error(`❌ 爬取失败: ${error.message}`);
    } finally {
      await page.close();
    }

    return flights;

    /*
    // 真实爬虫实现（需要根据实际页面调整）
    const page = await this.browser!.newPage();

    try {
      await page.setUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
      );

      await page.goto('https://m.hnair.com/hnams/plusMember/ableAirlineQuery', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      await page.waitForTimeout(2000);

      // 1. 选择出发地
      // 2. 选择日期
      // 3. 点击查询
      // 4. 等待结果
      // 5. 提取数据

      const flightData = await page.evaluate(() => {
        const results: any[] = [];
        // 根据实际页面结构提取数据
        return results;
      });

      for (const data of flightData) {
        flights.push({
          flightNo: data.flightNo,
          origin: origin,
          destination: data.destination,
          departureTime: new Date(data.departureTime),
          arrivalTime: new Date(data.arrivalTime),
          availableSeats: data.availableSeats,
          cardType: '全部',
          crawledAt: new Date(),
        });
      }

      await page.close();
    } catch (error) {
      this.logger.error(`爬取 ${date} 失败`, error);
      await page.close();
    }

    return flights;
    */
  }

  /**
   * 选择出发地（多种策略）
   */
  private async selectOrigin(page: puppeteer.Page, origin: string): Promise<boolean> {
    this.logger.log(`🛫 尝试选择出发地: ${origin}`);

    try {
      // 策略 1: 直接点击 .dep-box（针对海南航空页面）
      this.logger.log(`[策略1] 尝试点击 .dep-box`);
      const strategy1 = await page.evaluate(() => {
        const depBox = document.querySelector('.dep-box');
        console.log(`[策略1] 找到 .dep-box: ${depBox ? '是' : '否'}`);

        if (depBox) {
          console.log(`[策略1] 点击 .dep-box`);
          (depBox as HTMLElement).click();
          return true;
        }

        return false;
      });

      if (strategy1) {
        this.logger.log('✅ [策略1] 点击 .dep-box 成功');
        await page.waitForTimeout(1000);

        // 输入城市名称
        this.logger.log(`⌨️ 输入城市: ${origin}`);
        await page.keyboard.type(origin, { delay: 100 });
        await page.waitForTimeout(1500);

        // 选择城市
        const citySelected = await this.selectCityFromDropdown(page, origin);
        if (citySelected) {
          return true;
        }
      }

      // 策略 2: 查找出发地输入框（通过 placeholder）
      this.logger.log(`[策略2] 尝试通过 placeholder 查找输入框`);
      const strategy2 = await page.evaluate((cityName) => {
        console.log(`[策略2] 查找出发地输入框`);
        const inputs = document.querySelectorAll('input[type="text"], input:not([type])');
        console.log(`[策略2] 找到 ${inputs.length} 个输入框`);

        for (const input of inputs) {
          const inputEl = input as HTMLInputElement;
          const placeholder = inputEl.placeholder || '';
          const value = inputEl.value || '';

          if (placeholder.includes('出发') || placeholder.includes('起点') || value.includes('请选择')) {
            console.log(`[策略2] 找到出发地输入框: ${placeholder}`);
            inputEl.focus();
            inputEl.click();
            return true;
          }
        }
        return false;
      }, origin);

      if (strategy2) {
        this.logger.log('✅ [策略2] 找到出发地输入框');
        await page.waitForTimeout(1000);

        // 清空输入框
        await page.keyboard.down('Control');
        await page.keyboard.press('A');
        await page.keyboard.up('Control');
        await page.keyboard.press('Backspace');

        // 输入城市名称
        await page.keyboard.type(origin, { delay: 100 });
        this.logger.log(`⌨️ 输入城市: ${origin}`);
        await page.waitForTimeout(1500);

        // 查找并点击匹配的城市选项
        const citySelected = await this.selectCityFromDropdown(page, origin);
        if (citySelected) {
          return true;
        }
      }

      // 策略 3: 查找包含"出发地"文本的可点击元素
      this.logger.log(`[策略3] 尝试通过文本查找`);
      const strategy3 = await page.evaluate((cityName) => {
        console.log(`[策略3] 查找包含"出发地"的元素`);
        const allElements = Array.from(document.querySelectorAll('div, span, button, a'));
        console.log(`[策略3] 找到 ${allElements.length} 个元素`);

        for (const el of allElements) {
          const text = el.textContent || '';
          // 匹配"出发地"、"出发城市"等
          if ((text.includes('出发地') || text.includes('出发城市')) && text.length < 20) {
            console.log(`[策略3] 找到出发地选择器: ${text}`);
            (el as HTMLElement).click();
            return true;
          }
        }
        return false;
      }, origin);

      if (strategy3) {
        this.logger.log('✅ [策略3] 点击出发地选择器');
        await page.waitForTimeout(1000);

        // 输入城市名称
        await page.keyboard.type(origin, { delay: 100 });
        this.logger.log(`⌨️ 输入城市: ${origin}`);
        await page.waitForTimeout(1500);

        // 选择城市
        const citySelected = await this.selectCityFromDropdown(page, origin);
        if (citySelected) {
          return true;
        }
      }

      // 策略 4: 查找 select 下拉框
      this.logger.log(`[策略4] 尝试通过 select 下拉框`);
      const strategy4 = await page.evaluate((cityName) => {
        console.log(`[策略4] 查找 select 下拉框`);
        const selects = document.querySelectorAll('select');
        console.log(`[策略4] 找到 ${selects.length} 个 select`);

        for (const select of selects) {
          const selectEl = select as HTMLSelectElement;
          const options = Array.from(selectEl.options);

          // 查找匹配的城市选项
          for (const option of options) {
            if (option.text.includes(cityName)) {
              console.log(`[策略4] 在下拉框中找到城市: ${option.text}`);
              selectEl.value = option.value;
              selectEl.dispatchEvent(new Event('change', { bubbles: true }));
              return true;
            }
          }
        }
        return false;
      }, origin);

      if (strategy4) {
        this.logger.log(`✅ [策略4] 通过 select 下拉框选择成功: ${origin}`);
        await page.waitForTimeout(1000);
        return true;
      }

      this.logger.error(`❌ 所有 4 种策略都失败，未找到出发地选择器`);
      return false;

    } catch (error) {
      this.logger.error(`❌ 选择出发地异常: ${error.message}`);
      return false;
    }
  }

  /**
   * 点击查询按钮（多种策略）
   */
  private async clickSearchButton(page: puppeteer.Page): Promise<boolean> {
    this.logger.log('🔍 尝试点击查询按钮');

    try {
      // 策略 1: 直接点击 .query-btn（针对海南航空页面）
      this.logger.log(`[策略1] 尝试点击 .query-btn`);
      const strategy1 = await page.evaluate(() => {
        const queryBtn = document.querySelector('.query-btn');
        console.log(`[策略1] 找到 .query-btn: ${queryBtn ? '是' : '否'}`);

        if (queryBtn) {
          console.log(`[策略1] 点击 .query-btn`);
          (queryBtn as HTMLElement).click();
          return true;
        }

        return false;
      });

      if (strategy1) {
        this.logger.log('✅ [策略1] 点击 .query-btn 成功');
        await page.waitForTimeout(3000);
        return true;
      }

      // 策略 2: 通过文本精确匹配"查询"、"搜索"等
      this.logger.log(`[策略2] 尝试通过文本匹配`);
      const strategy2 = await page.evaluate(() => {
        console.log(`[策略2] 查找查询按钮`);
        const buttons = document.querySelectorAll('button, a[role="button"], div[role="button"]');
        console.log(`[策略2] 找到 ${buttons.length} 个按钮`);

        for (const btn of buttons) {
          const text = (btn.textContent || '').trim();
          // 精确匹配常见的查询按钮文本
          if (text === '查询' || text === '查询航班' || text === '搜索' || text === '搜索航班') {
            console.log(`[策略2] 找到查询按钮: ${text}`);
            (btn as HTMLElement).click();
            return true;
          }
        }
        return false;
      });

      if (strategy2) {
        this.logger.log('✅ [策略2] 通过文本匹配找到查询按钮');
        await page.waitForTimeout(3000);
        return true;
      }

      // 策略 3: 通过 class 或 id 属性查找
      this.logger.log(`[策略3] 尝试通过属性查找`);
      const strategy3 = await page.evaluate(() => {
        console.log(`[策略3] 通过属性查找查询按钮`);
        const selectors = [
          'button[class*="search"]',
          'button[class*="query"]',
          'button[id*="search"]',
          'button[id*="query"]',
          '[class*="search-btn"]',
          '[class*="query-btn"]',
        ];

        for (const selector of selectors) {
          const btn = document.querySelector(selector);
          if (btn) {
            console.log(`[策略3] 找到查询按钮: ${selector}`);
            (btn as HTMLElement).click();
            return true;
          }
        }
        return false;
      });

      if (strategy3) {
        this.logger.log('✅ [策略3] 通过属性找到查询按钮');
        await page.waitForTimeout(3000);
        return true;
      }

      // 策略 4: 查找包含"查询"文本的任意元素
      this.logger.log(`[策略4] 尝试模糊文本匹配`);
      const strategy4 = await page.evaluate(() => {
        console.log(`[策略4] 模糊查找包含"查询"的元素`);
        const allElements = Array.from(document.querySelectorAll('*'));
        console.log(`[策略4] 扫描 ${allElements.length} 个元素`);

        for (const el of allElements) {
          const text = (el.textContent || '').trim();
          if (text.includes('查询') && text.length < 10) {
            // 确保是可点击的元素
            const tagName = el.tagName.toLowerCase();
            if (tagName === 'button' || tagName === 'a' || el.getAttribute('onclick')) {
              console.log(`[策略4] 找到查询元素: ${text}`);
              (el as HTMLElement).click();
              return true;
            }
          }
        }
        return false;
      });

      if (strategy4) {
        this.logger.log('✅ [策略4] 通过文本模糊匹配找到查询按钮');
        await page.waitForTimeout(3000);
        return true;
      }

      // 策略 5: 尝试通过 form 提交
      this.logger.log(`[策略5] 尝试表单提交`);
      const strategy5 = await page.evaluate(() => {
        console.log(`[策略5] 查找表单`);
        const forms = document.querySelectorAll('form');
        console.log(`[策略5] 找到 ${forms.length} 个表单`);

        if (forms.length > 0) {
          console.log('[策略5] 尝试提交表单');
          const form = forms[0] as HTMLFormElement;
          form.submit();
          return true;
        }
        return false;
      });

      if (strategy5) {
        this.logger.log('✅ [策略5] 通过表单提交');
        await page.waitForTimeout(3000);
        return true;
      }

      this.logger.error('❌ 所有 5 种策略都失败，未找到查询按钮');
      return false;

    } catch (error) {
      this.logger.error(`❌ 点击查询按钮异常: ${error.message}`);
      return false;
    }
  }

  /**
   * 从下拉列表中选择城市
   */
  private async selectCityFromDropdown(page: puppeteer.Page, cityName: string): Promise<boolean> {
    try {
      this.logger.log(`🔍 尝试从下拉列表选择城市: ${cityName}`);

      const citySelected = await page.evaluate((city) => {
        console.log(`查找城市: ${city}`);
        // 查找所有可能的城市列表项
        const selectors = [
          'li', 'div[class*="item"]', 'div[class*="option"]',
          'span[class*="city"]', 'a[class*="city"]',
          '[role="option"]', '[class*="dropdown"] div',
        ];

        for (const selector of selectors) {
          const items = document.querySelectorAll(selector);
          console.log(`选择器 "${selector}" 找到 ${items.length} 个元素`);

          for (const item of items) {
            const text = (item.textContent || '').trim();
            // 精确匹配或包含城市名
            if (text === city || text.includes(city)) {
              console.log(`✓ 找到匹配城市: ${text}`);
              (item as HTMLElement).click();
              return true;
            }
          }
        }
        console.log(`✗ 未找到匹配的城市`);
        return false;
      }, cityName);

      if (citySelected) {
        this.logger.log(`✅ 选择城市成功: ${cityName}`);
        await page.waitForTimeout(1000);
        return true;
      }

      // 如果没有找到下拉项，尝试直接回车确认
      this.logger.log('⚠️ 未找到下拉项，尝试回车确认');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      this.logger.log('✅ 已按回车键');
      return true;

    } catch (error) {
      this.logger.error(`选择城市失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 选择权益卡类型（多种策略）
   */
  private async selectCardType(page: puppeteer.Page, cardType: string): Promise<boolean> {
    this.logger.log(`🎫 尝试选择权益卡类型: ${cardType}`);

    try {
      // 策略 1: 通过 .search-item 直接点击（针对海南航空页面）
      this.logger.log(`[策略1] 尝试通过 .search-item 选择`);
      const strategy1 = await page.evaluate((targetCardType) => {
        const items = document.querySelectorAll('.search-item');
        console.log(`[策略1] 找到 ${items.length} 个 .search-item 元素`);

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const text = item.textContent?.trim() || '';
          console.log(`[策略1] 检查元素 ${i}: "${text}"`);

          if (text === targetCardType || text.includes(targetCardType.replace('权益卡航班', ''))) {
            console.log(`[策略1] 匹配成功，点击元素 ${i}`);
            (item as HTMLElement).click();
            return true;
          }
        }

        console.log(`[策略1] 未找到匹配的元素`);
        return false;
      }, cardType);

      if (strategy1) {
        this.logger.log(`✅ [策略1] 通过 .search-item 选择成功: ${cardType}`);
        await page.waitForTimeout(1500);
        return true;
      }

      // 策略 2: 通过 radio 单选按钮 + label 组合
      this.logger.log(`[策略2] 尝试通过 radio 选择`);
      const strategy2 = await page.evaluate((targetCardType) => {
        // 查找所有 radio 输入框
        const radioInputs = document.querySelectorAll('input[type="radio"]');
        console.log(`[策略2] 找到 ${radioInputs.length} 个 radio 元素`);

        for (const radio of radioInputs) {
          // 查找关联的 label
          const radioEl = radio as HTMLInputElement;
          let labelText = '';

          // 方式1: 通过 id 查找 label
          if (radioEl.id) {
            const label = document.querySelector(`label[for="${radioEl.id}"]`);
            if (label) {
              labelText = label.textContent || '';
            }
          }

          // 方式2: 查找父级 label
          if (!labelText) {
            const parentLabel = radioEl.closest('label');
            if (parentLabel) {
              labelText = parentLabel.textContent || '';
            }
          }

          // 方式3: 查找相邻的文本节点或 span
          if (!labelText) {
            const nextSibling = radioEl.nextElementSibling;
            if (nextSibling) {
              labelText = nextSibling.textContent || '';
            }
          }

          // 匹配权益卡类型
          if (labelText.includes(targetCardType)) {
            console.log(`[策略1] 找到权益卡 radio: ${labelText}`);
            radioEl.click();
            return true;
          }
        }
        return false;
      }, cardType);

      if (strategy2) {
        this.logger.log(`✅ [策略2] 通过 radio 选择成功: ${cardType}`);
        await page.waitForTimeout(1500);
        return true;
      }

      // 策略 3: 通过文本内容查找可点击元素（包含数字）
      this.logger.log(`[策略3] 尝试通过文本匹配选择`);
      const cardTypeNumber = cardType.match(/\d+/)?.[0]; // 提取 "666" 或 "2666"
      if (cardTypeNumber) {
        const strategy3 = await page.evaluate((number) => {
          console.log(`[策略3] 查找包含数字 "${number}" 的元素`);
          const allElements = Array.from(document.querySelectorAll('div, span, label, button, a'));
          console.log(`[策略3] 找到 ${allElements.length} 个元素`);

          for (const el of allElements) {
            const text = el.textContent || '';
            // 精确匹配数字 + "权益卡"
            if (text.includes(number) && text.includes('权益卡')) {
              console.log(`[策略3] 找到权益卡元素: ${text}`);

              // 尝试点击自身或父元素
              let clickTarget: HTMLElement = el as HTMLElement;

              // 如果是 span/div，尝试找到可点击的父元素
              if (el.tagName === 'SPAN' || el.tagName === 'DIV') {
                const clickableParent = el.closest('button, a, label, [onclick], [role="button"]');
                if (clickableParent) {
                  clickTarget = clickableParent as HTMLElement;
                }
              }

              clickTarget.click();
              return true;
            }
          }
          return false;
        }, cardTypeNumber);

        if (strategy3) {
          this.logger.log(`✅ [策略3] 通过文本匹配选择成功: ${cardType}`);
          await page.waitForTimeout(1500);
          return true;
        }
      }

      // 策略 4: 通过 class 或 data 属性查找
      this.logger.log(`[策略4] 尝试通过属性选择`);
      const strategy4 = await page.evaluate((targetCardType, number) => {
        console.log(`[策略4] 查找属性包含 "${number}" 的元素`);
        // 查找包含特定 class 或 data 属性的元素
        // 查找包含特定 class 或 data 属性的元素
        const selectors = [
          `[class*="card"][class*="${number}"]`,
          `[class*="Card"][class*="${number}"]`,
          `[data-card*="${number}"]`,
          `[data-type*="${number}"]`,
        ];

        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            console.log(`[策略4] 找到元素: ${selector}`);
            (elements[0] as HTMLElement).click();
            return true;
          }
        }
        return false;
      }, cardType, cardTypeNumber);

      if (strategy4) {
        this.logger.log(`✅ [策略4] 通过属性选择成功: ${cardType}`);
        await page.waitForTimeout(1500);
        return true;
      }

      // 策略 5: 模糊匹配（最后的尝试）
      this.logger.log(`[策略5] 尝试完全匹配`);
      const strategy5 = await page.evaluate((targetCardType) => {
        console.log(`[策略5] 查找完全匹配 "${targetCardType}" 的元素`);
        const allElements = Array.from(document.querySelectorAll('*'));
        console.log(`[策略5] 扫描 ${allElements.length} 个元素`);

        for (const el of allElements) {
          const text = (el.textContent || '').trim();
          // 完全匹配权益卡名称
          if (text === targetCardType) {
            console.log(`[策略5] 完全匹配: ${text}`);
            (el as HTMLElement).click();
            return true;
          }
        }
        return false;
      }, cardType);

      if (strategy5) {
        this.logger.log(`✅ [策略5] 通过完全匹配选择成功: ${cardType}`);
        await page.waitForTimeout(1500);
        return true;
      }

      this.logger.error(`❌ 所有 5 种策略都失败，未找到权益卡: ${cardType}`);
      return false;

    } catch (error) {
      this.logger.error(`❌ 选择权益卡异常: ${error.message}`);
      return false;
    }
  }

  /**
   * 选择出发日期
   */
  private async selectDate(page: puppeteer.Page, targetDate: string): Promise<boolean> {
    this.logger.log(`📅 尝试选择日期: ${targetDate}`);

    try {
      // 策略 1: 点击日期选择器
      this.logger.log(`[策略1] 尝试点击日期选择器`);
      const dateBoxClicked = await page.evaluate(() => {
        const selectors = [
          '.date-box',
          '.dep-date',
          '[class*="date"]',
          'input[type="date"]',
          '[placeholder*="日期"]',
          '[placeholder*="出发"]',
        ];

        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          console.log(`选择器 "${selector}" 找到 ${elements.length} 个元素`);

          for (const el of elements) {
            const text = (el.textContent || '').trim();
            // 检查是否是日期相关的元素
            if (text.includes('日期') || text.includes('出发') || text.match(/\d{4}-\d{2}-\d{2}/) || text.match(/\d{2}\/\d{2}/)) {
              console.log(`✓ 找到日期元素: ${text}`);
              (el as HTMLElement).click();
              return true;
            }
          }
        }

        console.log(`✗ 未找到日期选择器`);
        return false;
      });

      if (!dateBoxClicked) {
        this.logger.warn('⚠️ 未找到日期选择器，可能页面默认日期已满足需求');
        return true; // 假设页面默认日期正确
      }

      this.logger.log('✅ 日期选择器已点击');
      await page.waitForTimeout(1000);

      // 策略 2: 从日历中选择日期
      this.logger.log(`[策略2] 从日历中选择日期: ${targetDate}`);

      // 解析目标日期
      const targetDateObj = new Date(targetDate);
      const targetDay = targetDateObj.getDate();
      const targetMonth = targetDateObj.getMonth() + 1;
      const targetYear = targetDateObj.getFullYear();

      this.logger.log(`目标日期: ${targetYear}年${targetMonth}月${targetDay}日`);

      const dateSelected = await page.evaluate((day, month, year) => {
        // 查找日历中的日期元素
        const selectors = [
          '.calendar-day',
          '.date-item',
          '[class*="day"]',
          '[class*="date-cell"]',
          'td[class*="day"]',
          'div[class*="day"]',
        ];

        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          console.log(`选择器 "${selector}" 找到 ${elements.length} 个日期元素`);

          for (const el of elements) {
            const text = (el.textContent || '').trim();
            const dayNumber = parseInt(text, 10);

            // 检查是否匹配目标日期
            if (dayNumber === day) {
              // 检查是否可点击（不是禁用状态）
              const isDisabled = el.classList.contains('disabled') ||
                                 el.classList.contains('past') ||
                                 el.hasAttribute('disabled');

              if (!isDisabled) {
                console.log(`✓ 找到可用日期: ${day}日`);
                (el as HTMLElement).click();
                return true;
              } else {
                console.log(`✗ 日期 ${day} 已禁用`);
              }
            }
          }
        }

        console.log(`✗ 未找到日期: ${day}日`);
        return false;
      }, targetDay, targetMonth, targetYear);

      if (dateSelected) {
        this.logger.log(`✅ 日期选择成功: ${targetDate}`);
        await page.waitForTimeout(1000);
        return true;
      }

      // 策略 3: 如果日历选择失败，尝试直接输入日期
      this.logger.log(`[策略3] 尝试直接输入日期`);
      const dateInput = await page.$('input[type="date"], input[placeholder*="日期"]');
      if (dateInput) {
        await dateInput.click({ clickCount: 3 }); // 选中所有文本
        await page.keyboard.type(targetDate);
        await page.keyboard.press('Enter');
        this.logger.log(`✅ 日期输入成功: ${targetDate}`);
        await page.waitForTimeout(1000);
        return true;
      }

      this.logger.warn('⚠️ 所有日期选择策略都失败，使用页面默认日期');
      return true; // 假设页面默认日期可用

    } catch (error) {
      this.logger.error(`❌ 选择日期异常: ${error.message}`);
      return false;
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
   * 调试爬虫 - 单次爬取指定城市（默认北京），行为与 trigger 完全一致
   * 以可视化模式运行，方便观察执行过程
   */
  async debugPageStructure(origin: string = '北京'): Promise<{
    success: boolean;
    count: number;
    flights: Partial<Flight>[];
    screenshots: string[];
  }> {
    this.logger.log(`🔍 开始调试爬虫 (城市: ${origin}, 可视化模式)...`);

    try {
      // 记录开始时间，用于筛选本次调试的截图
      const startTime = Date.now();

      // 只爬取明天的数据（单次测试）
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      const dates = [tomorrowStr];

      // 调用与 trigger 完全相同的爬虫逻辑，但以可视化模式运行（headless: false）
      // saveToDb: false 表示不保存到数据库，仅用于调试
      const { count, flights } = await this.crawlFlights(origin, dates, false, false);

      // 收集本次调试生成的截图（根据文件修改时间）
      const screenshots = fs.readdirSync(this.screenshotDir)
        .filter(file => {
          const filePath = path.join(this.screenshotDir, file);
          const stats = fs.statSync(filePath);
          // 只返回本次调试生成的截图（时间戳在开始时间之后）
          return stats.mtimeMs >= startTime && file.includes(origin) && file.includes(tomorrowStr);
        })
        .map(file => path.join(this.screenshotDir, file))
        .sort(); // 按文件名排序

      return {
        success: true,
        count: count,
        flights: flights, // 返回实际提取的航班数据
        screenshots: screenshots,
      };
    } catch (error) {
      this.logger.error('调试失败', error);
      return {
        success: false,
        count: 0,
        flights: [],
        screenshots: [],
      };
    }
  }

  /**
   * 创建执行日志
   */
  private async createCrawlerLog(
    taskType: CrawlerTaskType,
    days?: number,
  ): Promise<CrawlerLog> {
    this.logger.log(`📝 创建执行日志: taskType=${taskType}, days=${days}`);

    const log = this.crawlerLogRepository.create({
      taskType,
      status: CrawlerTaskStatus.RUNNING,
      days,
      startTime: new Date(),
    });

    const savedLog = await this.crawlerLogRepository.save(log);
    this.logger.log(`✅ 日志已保存: id=${savedLog.id}`);

    return savedLog;
  }

  /**
   * 更新执行日志
   */
  private async updateCrawlerLog(
    logId: number,
    data: Partial<CrawlerLog>,
  ): Promise<void> {
    await this.crawlerLogRepository.update(logId, data);
  }

  /**
   * 完成执行日志
   */
  private async completeCrawlerLog(
    logId: number,
    success: boolean,
    result: {
      airportCount?: number;
      flightCount?: number;
      details?: any;
      errorMessage?: string;
    },
  ): Promise<void> {
    this.logger.log(`📝 完成执行日志: logId=${logId}, success=${success}`);

    const log = await this.crawlerLogRepository.findOne({ where: { id: logId } });
    if (!log) {
      this.logger.error(`❌ 日志不存在: logId=${logId}`);
      return;
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - log.startTime.getTime()) / 1000);

    const updateResult = await this.crawlerLogRepository.update(logId, {
      status: success ? CrawlerTaskStatus.SUCCESS : CrawlerTaskStatus.FAILED,
      airportCount: result.airportCount || 0,
      flightCount: result.flightCount || 0,
      details: result.details ? JSON.stringify(result.details) : undefined,
      errorMessage: result.errorMessage || undefined,
      endTime,
      duration,
    });

    this.logger.log(`✅ 日志已更新: logId=${logId}, affected=${updateResult.affected}`);
  }

  /**
   * 初始化逻辑1：发现所有机场
   * 以北京、上海、深圳为起点，爬取航班数据并自动发现所有可达的机场
   * 注意：发现阶段不会清理机场数据（只追加新机场），但会清理临时航班数据
   */
  async initializeDiscoverAirports(days: number = 1): Promise<{ success: boolean; airportCount: number; flightCount: number }> {
    this.logger.log(`🔍 【初始化阶段1】开始发现机场（爬取未来 ${days} 天）...`);

    // 创建执行日志
    const log = await this.createCrawlerLog(CrawlerTaskType.DISCOVER_AIRPORTS, days);

    try {
      // 种子机场：用于发现其他机场
      // 使用精准的机场名，确保同城多机场都能被爬取
      const seedAirports = [
        '北京首都',
        '北京大兴',
        '上海浦东',
        '上海虹桥',
        '深圳',
      ];

      // 生成日期范围（从明天开始）
      const dates: string[] = [];
      for (let i = 1; i <= days; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }

      // 采用"爬取完成后一次性替换"的策略
      // 先爬取所有数据，然后一次性删除旧数据并保存新数据
      // 这样可以最小化数据空白期，同时确保新数据完全覆盖旧数据
      this.logger.log('📝 采用智能替换模式：爬取完成后一次性替换旧数据...');

      // 并行爬取所有种子机场（提效）
      this.logger.log(`🚀 并行爬取 ${seedAirports.length} 个种子机场...`);
      const seedAirportResults: Record<string, number> = {};

      const crawlPromises = seedAirports.map(airport =>
        this.crawlFlights(airport, dates, true, false)
          .then(({ flights }) => {
            this.logger.log(`✅ ${airport} 发现 ${flights.length} 条航班`);
            seedAirportResults[airport] = flights.length;
            return flights;
          })
          .catch(error => {
            this.logger.error(`❌ ${airport} 爬取失败`, error);
            seedAirportResults[airport] = 0;
            return [];
          })
      );

      const flightsArrays = await Promise.all(crawlPromises);
      const allFlights = flightsArrays.flat();

      // 爬取完成后，删除旧数据并保存新数据（一次性操作，最小化空白期）
      if (allFlights.length > 0) {
        this.logger.log(`🔄 开始替换数据：删除旧数据并保存 ${allFlights.length} 条新数据...`);
        const deletedCount = await this.flightService.deleteDiscoveryFlights(dates);
        this.logger.log(`🗑️ 已删除 ${deletedCount} 条旧数据`);
        await this.flightService.saveFlights(allFlights);
        this.logger.log(`✅ 已保存 ${allFlights.length} 条新数据`);
      }

      // 从航班数据中自动发现机场
      this.logger.log(`📊 分析航班数据，发现机场...`);
      await this.flightService.discoverAirportsFromFlights(allFlights);

      // 获取发现的机场数量
      const airports = await this.flightService.getEnabledOriginAirports();

      this.logger.log(`✅ 【初始化阶段1】完成！发现 ${airports.length} 个机场`);
      this.logger.log(`📋 机场列表: ${airports.join(', ')}`);

      // 完成日志记录
      await this.completeCrawlerLog(log.id, true, {
        airportCount: airports.length,
        flightCount: allFlights.length,
        details: {
          seedAirports,
          seedAirportResults,
          discoveredAirports: airports,
          dateRange: dates,
        },
      });

      return {
        success: true,
        airportCount: airports.length,
        flightCount: allFlights.length,
      };
    } catch (error) {
      this.logger.error('❌ 【初始化阶段1】失败', error);

      // 记录失败日志
      await this.completeCrawlerLog(log.id, false, {
        airportCount: 0,
        flightCount: 0,
        errorMessage: error.message || '未知错误',
      });

      return { success: false, airportCount: 0, flightCount: 0 };
    }
  }

  /**
   * 初始化逻辑2：发现航班所有航班数据
   * 基于已发现的机场，全量爬取未来7天的航班数据
   * 注意：发现航班前会先清理所有未来的航班数据，确保数据最新且无重复
   */
  async initializeRefreshFlights(days: number = 7): Promise<{ success: boolean; count: number }> {
    this.logger.log(`🔄 【初始化阶段2】开始发现航班数据（爬取未来 ${days} 天）...`);

    // 创建执行日志
    const log = await this.createCrawlerLog(CrawlerTaskType.REFRESH_FLIGHTS, days);

    try {
      // 获取所有启用爬虫的机场
      const airports = await this.flightService.getEnabledOriginAirports();

      if (airports.length === 0) {
        this.logger.warn('⚠️ 没有可用的机场，请先执行【初始化阶段1】发现机场');

        // 记录失败日志
        await this.completeCrawlerLog(log.id, false, {
          airportCount: 0,
          flightCount: 0,
          errorMessage: '没有可用的机场，请先执行发现机场',
        });

        return { success: false, count: 0 };
      }

      this.logger.log(`📋 准备爬取 ${airports.length} 个机场: ${airports.join(', ')}`);

      // 生成日期范围（从明天开始）
      const dates: string[] = [];
      for (let i = 1; i <= days; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }

      // 采用"爬取完成后一次性替换"的策略
      // 先爬取所有数据，然后一次性删除旧数据并保存新数据
      // 这样可以最小化数据空白期，同时确保新数据完全覆盖旧数据
      this.logger.log('📝 采用智能替换模式：爬取完成后一次性替换旧数据...');

      // 并行爬取所有机场，但限制并发数（避免过载）
      const CONCURRENT_LIMIT = 5; // 最多同时爬取 5 个机场
      let totalCount = 0;
      const airportResults: Record<string, number> = {};
      const allCollectedFlights: Partial<Flight>[] = []; // 收集所有爬取的航班

      this.logger.log(`🚀 并行爬取 ${airports.length} 个机场（并发限制: ${CONCURRENT_LIMIT}）...`);

      // 分批执行，每批最多 CONCURRENT_LIMIT 个
      for (let i = 0; i < airports.length; i += CONCURRENT_LIMIT) {
        const batch = airports.slice(i, i + CONCURRENT_LIMIT);
        this.logger.log(`📦 批次 ${Math.floor(i / CONCURRENT_LIMIT) + 1}/${Math.ceil(airports.length / CONCURRENT_LIMIT)}: ${batch.join(', ')}`);

        const batchPromises = batch.map(airport =>
          this.crawlFlights(airport, dates, true, false) // 不直接保存，先收集
            .then(({ count, flights }) => {
              this.logger.log(`✅ ${airport} 爬取完成，获得 ${count} 条数据`);
              airportResults[airport] = count;
              allCollectedFlights.push(...flights); // 收集航班数据
              return count;
            })
            .catch(error => {
              this.logger.error(`❌ ${airport} 爬取失败`, error);
              airportResults[airport] = 0;
              return 0;
            })
        );

        const batchCounts = await Promise.all(batchPromises);
        totalCount += batchCounts.reduce((sum, count) => sum + count, 0);
      }

      // 爬取完成后，删除旧数据并保存新数据（一次性操作，最小化空白期）
      if (allCollectedFlights.length > 0) {
        this.logger.log(`🔄 开始替换数据：删除旧数据并保存 ${allCollectedFlights.length} 条新数据...`);
        const deletedCount = await this.flightService.deleteFutureFlights();
        this.logger.log(`🗑️ 已删除 ${deletedCount} 条旧数据`);
        await this.flightService.saveFlights(allCollectedFlights);
        this.logger.log(`✅ 已保存 ${allCollectedFlights.length} 条新数据`);
      }

      this.logger.log(`✅ 【初始化阶段2】完成！共爬取 ${totalCount} 条航班数据`);

      // 完成日志记录
      await this.completeCrawlerLog(log.id, true, {
        airportCount: airports.length,
        flightCount: totalCount,
        details: {
          airports,
          airportResults,
          dateRange: dates,
          updateMode: 'smart-replace', // 采用智能替换模式
        },
      });

      return { success: true, count: totalCount };
    } catch (error) {
      this.logger.error('❌ 【初始化阶段2】失败', error);

      // 记录失败日志
      await this.completeCrawlerLog(log.id, false, {
        airportCount: 0,
        flightCount: 0,
        errorMessage: error.message || '未知错误',
      });

      return { success: false, count: 0 };
    }
  }

  /**
   * 手动触发爬虫（用于测试）- 执行完整的两阶段初始化
   */
  async triggerCrawl(): Promise<{ success: boolean; count: number }> {
    try {
      // 先检查是否已有机场数据
      const existingAirports = await this.flightService.getEnabledOriginAirports();

      if (existingAirports.length === 0) {
        this.logger.log('🆕 首次运行，执行完整初始化流程...');

        // 阶段1：发现机场
        const phase1 = await this.initializeDiscoverAirports();
        if (!phase1.success) {
          return { success: false, count: 0 };
        }

        // 阶段2：发现航班数据
        const phase2 = await this.initializeRefreshFlights();
        return phase2;
      } else {
        this.logger.log('🔄 机场已存在，直接发现航班航班数据...');
        // 如果已有机场数据，直接发现航班
        return this.initializeRefreshFlights();
      }
    } catch (error) {
      this.logger.error('手动触发爬虫失败', error);
      return { success: false, count: 0 };
    }
  }

  /**
   * 定时任务：每天凌晨 2 点自动爬取数据
   */
  @Cron('0 2 * * *', {
    name: 'auto-crawl-flights',
    timeZone: 'Asia/Shanghai',
  })
  async scheduledCrawl() {
    this.logger.log('⏰ 定时任务启动：开始自动爬取航班数据');
    try {
      const result = await this.triggerCrawl();
      this.logger.log(`✅ 定时任务完成：共爬取 ${result.count} 条数据`);

      // 清理过期数据
      await this.flightService.deleteExpiredFlights();
      this.logger.log('🗑️ 过期数据清理完成');
    } catch (error) {
      this.logger.error('❌ 定时任务失败', error);
    }
  }

  /**
   * 查询执行日志
   */
  async queryLogs(
    taskType?: CrawlerTaskType,
    status?: CrawlerTaskStatus,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{ logs: CrawlerLog[]; total: number; page: number; pageSize: number }> {
    const queryBuilder = this.crawlerLogRepository.createQueryBuilder('log');

    // 筛选条件
    if (taskType) {
      queryBuilder.andWhere('log.taskType = :taskType', { taskType });
    }
    if (status) {
      queryBuilder.andWhere('log.status = :status', { status });
    }

    // 排序和分页
    queryBuilder
      .orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [logs, total] = await queryBuilder.getManyAndCount();

    return {
      logs,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取日志详情
   */
  async getLogDetail(id: number): Promise<CrawlerLog | null> {
    return this.crawlerLogRepository.findOne({ where: { id } });
  }

  /**
   * 获取日志统计信息
   */
  async getLogStats(): Promise<{
    total: number;
    successCount: number;
    failedCount: number;
    runningCount: number;
    todayCount: number;
  }> {
    const total = await this.crawlerLogRepository.count();

    const successCount = await this.crawlerLogRepository.count({
      where: { status: CrawlerTaskStatus.SUCCESS },
    });

    const failedCount = await this.crawlerLogRepository.count({
      where: { status: CrawlerTaskStatus.FAILED },
    });

    const runningCount = await this.crawlerLogRepository.count({
      where: { status: CrawlerTaskStatus.RUNNING },
    });

    // 今天的执行次数
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await this.crawlerLogRepository
      .createQueryBuilder('log')
      .where('log.createdAt >= :today', { today })
      .getCount();

    return {
      total,
      successCount,
      failedCount,
      runningCount,
      todayCount,
    };
  }

  /**
   * 清理旧日志
   * @param days 保留最近多少天的日志（默认 90 天）
   * @returns 删除的日志数量
   */
  async cleanOldLogs(days: number = 90): Promise<{ deletedCount: number }> {
    this.logger.log(`开始清理 ${days} 天前的日志`);

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      cutoffDate.setHours(0, 0, 0, 0);

      const result = await this.crawlerLogRepository
        .createQueryBuilder()
        .delete()
        .where('createdAt < :cutoffDate', { cutoffDate })
        .execute();

      const deletedCount = result.affected || 0;
      this.logger.log(`✅ 清理完成，删除了 ${deletedCount} 条日志`);

      return { deletedCount };
    } catch (error) {
      this.logger.error('清理日志失败', error);
      throw error;
    }
  }

  /**
   * 清理所有日志（危险操作）
   * @returns 删除的日志数量
   */
  async cleanAllLogs(): Promise<{ deletedCount: number }> {
    this.logger.warn('⚠️ 开始清理所有日志');

    try {
      const result = await this.crawlerLogRepository
        .createQueryBuilder()
        .delete()
        .execute();

      const deletedCount = result.affected || 0;
      this.logger.log(`✅ 清理完成，删除了 ${deletedCount} 条日志`);

      return { deletedCount };
    } catch (error) {
      this.logger.error('清理日志失败', error);
      throw error;
    }
  }
}
