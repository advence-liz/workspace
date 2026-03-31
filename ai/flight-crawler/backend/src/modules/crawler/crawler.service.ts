import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
// puppeteer 为可选依赖，仅本地爬虫环境需要，生产环境动态加载
// eslint-disable-next-line @typescript-eslint/no-require-imports
const puppeteer = (() => { try { return require('puppeteer'); } catch { return null; } })();
import * as fs from 'fs';
import * as path from 'path';
import { FlightService } from '../flight/flight.service';
import { RouteService } from '../route/route.service';
import { Flight } from '../flight/entities/flight.entity';
import {
  CrawlerLog,
  CrawlerTaskType,
  CrawlerTaskStatus
} from './entities/crawler-log.entity';

@Injectable()
export class CrawlerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CrawlerService.name);
  private browser: any | null = null;
  private readonly screenshotDir = path.join(process.cwd(), 'debug-screenshots');
  private isCrawlerRunning = false; // 并发锁：防止多个爬虫同时运行
  private runningTaskId: number | null = null; // 当前运行的任务 ID
  private stopRequested = false; // 停止信号：true 时后台任务应尽快退出

  // ─── 并发常量（修改这里会同步影响执行逻辑和预估时间）─────────────────
  /** 发现机场：共享浏览器，最多同时开几个 page */
  private static readonly DISCOVER_AIRPORTS_PAGE_CONCURRENCY = 5;
  /** 发现航班：最多同时执行几个日期任务（每个日期独立浏览器） */
  private static readonly REFRESH_FLIGHTS_DATE_CONCURRENCY = 10;
  /** 发现航班：每个日期任务内最多同时爬几个机场 page */
  private static readonly REFRESH_FLIGHTS_AIRPORT_CONCURRENCY = 3;
  /** 实测单机场单次爬取耗时（秒），用于预估总时间 */
  private static readonly SECONDS_PER_AIRPORT = 30;

  constructor(
    private readonly flightService: FlightService,
    private readonly routeService: RouteService,
    private readonly schedulerRegistry: SchedulerRegistry,
    @InjectRepository(CrawlerLog)
    private readonly crawlerLogRepository: Repository<CrawlerLog>,
  ) {
    // 确保截图目录存在
    this.ensureScreenshotDir();
  }

  /**
   * 应用启动后，根据环境变量决定是否停止自动爬取任务
   * 默认关闭，CRAWLER_AUTO_CRAWL=true 时才开启
   */
  onApplicationBootstrap() {
    const enabled = process.env.CRAWLER_AUTO_CRAWL === 'true';
    if (!enabled) {
      try {
        this.schedulerRegistry.getCronJob('auto-crawl-flights').stop();
        this.logger.log('⚙️ auto-crawl-flights 定时任务已禁用（需设置 CRAWLER_AUTO_CRAWL=true 开启）');
      } catch { /* 任务不存在时忽略 */ }
    }
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
   * 安全截图：失败时只记录警告，不抛出异常
   */
  private async safeScreenshot(page: any, filePath: string, label: string): Promise<void> {
    try {
      this.ensureScreenshotDir();
      await page.screenshot({ path: filePath, fullPage: true });
      this.logger.log(`📸 ${label}: ${filePath}`);
    } catch (e) {
      this.logger.warn(`⚠️ 截图失败 [${label}]: ${e.message}`);
    }
  }

  /**
   * 清理旧的截图文件
   */
  private cleanOldScreenshots(): void {
    try {
      if (fs.existsSync(this.screenshotDir)) {
        const files = fs.readdirSync(this.screenshotDir);
        let deletedCount = 0;

        files.forEach(file => {
          if (file.endsWith('.png')) {
            const filePath = path.join(this.screenshotDir, file);
            fs.unlinkSync(filePath);
            deletedCount++;
          }
        });

        if (deletedCount > 0) {
          this.logger.log(`🗑️ 已清理 ${deletedCount} 个旧截图文件`);
        }
      }
    } catch (error) {
      this.logger.warn('清理截图文件失败', error);
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
    enableScreenshot: boolean = false,
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
        const dayFlights = await this.crawlFlightsByDate(origin, date, cardTypes, undefined, enableScreenshot);
        this.logger.log(`✅ ${origin} - ${date}: 爬取 ${dayFlights.length} 条航班`);
        flights.push(...dayFlights);

        // 随机延迟，避免被封
        await this.randomDelay();
      }

      this.logger.log(`📊 ${origin} 总计爬取 ${flights.length} 条航班`);

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
   * @param externalBrowser 可选的外部浏览器实例（用于共享浏览器场景）
   * @param enableScreenshot 是否开启截图（仅 debug 模式使用，默认 false）
   */
  private async crawlFlightsByDate(
    origin: string,
    date: string,
    cardTypes: string | string[],
    externalBrowser?: any,
    enableScreenshot = false,
  ): Promise<Partial<Flight>[]> {
    // 统一处理为数组
    const cardTypeArray = Array.isArray(cardTypes) ? cardTypes : [cardTypes];
    const browserToUse = externalBrowser || this.browser!;
    const page = await browserToUse.newPage();
    const flights: Partial<Flight>[] = [];
    const apiResponses: any[] = [];

    try {
      // 设置视口（模拟手机）
      await page.setViewport({ width: 375, height: 812 });

      // 设置 User-Agent
      await page.setUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      );

      // 监听浏览器控制台输出
      page.on('console', (msg: any) => {
        const text = msg.text();
        // 只记录我们的调试信息
        if (text.includes('===') || text.includes('选择器') || text.includes('日期元素') || text.includes('✓') || text.includes('✗')) {
          this.logger.log(`[浏览器控制台] ${text}`);
        }
      });

      // 监听所有网络请求
      page.on('response', async (response: any) => {
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
      if (enableScreenshot) await this.safeScreenshot(page, screenshotInitPath, '初始截图');

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
        if (enableScreenshot) await this.safeScreenshot(page, path.join(this.screenshotDir, `${timestamp}-${origin}-${date}-${cardTypeShort}-card-fail.png`), '权益卡选择失败截图');
        return flights;
      }
      this.logger.log(`✅ 所有权益卡选择完成: ${cardTypeLabel}`);

      // 等待页面响应
      await page.waitForTimeout(1000);

      // 截图查看权益卡选择后的状态
      if (enableScreenshot) await this.safeScreenshot(page, path.join(this.screenshotDir, `${timestamp}-${origin}-${date}-${cardTypeShort}-card-selected.png`), '权益卡选择后截图');

      // 选择出发地
      this.logger.log(`🛫 开始选择出发地: ${origin}`);
      const originSelected = await this.selectOrigin(page, origin);
      if (!originSelected) {
        this.logger.warn(`⚠️ 出发地选择失败，跳过: ${origin}`);
        if (enableScreenshot) await this.safeScreenshot(page, path.join(this.screenshotDir, `${timestamp}-${origin}-${date}-${cardTypeShort}-origin-fail.png`), '出发地选择失败截图');
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
        if (enableScreenshot) await this.safeScreenshot(page, path.join(this.screenshotDir, `${timestamp}-${origin}-${date}-${cardTypeShort}-date-fail.png`), '日期选择失败截图');
        return flights;
      }
      this.logger.log(`✅ 日期选择成功: ${date}`);

      // 等待页面响应
      await page.waitForTimeout(1000);

      // 截图查看操作后的状态
      if (enableScreenshot) await this.safeScreenshot(page, path.join(this.screenshotDir, `${timestamp}-${origin}-${date}-${cardTypeShort}-after.png`), '操作后截图');

      // 点击查询按钮
      this.logger.log(`🔍 开始点击查询按钮`);
      const queryClicked = await this.clickSearchButton(page);
      if (!queryClicked) {
        this.logger.warn('⚠️ 查询按钮点击失败，跳过');
        if (enableScreenshot) await this.safeScreenshot(page, path.join(this.screenshotDir, `${timestamp}-${origin}-${date}-${cardTypeShort}-query-fail.png`), '查询按钮点击失败截图');
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
      if (enableScreenshot) await this.safeScreenshot(page, path.join(this.screenshotDir, `${timestamp}-${origin}-${date}-${cardTypeShort}-result.png`), '查询结果截图');

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

            // 调试：记录所有航班的目的地
            const allDestinations = possibleFlights.map((f: any) => f.destination || f.arrCity || f.arrival || '(空)');
            this.logger.debug(`📊 所有目的地: ${Array.from(new Set(allDestinations)).join(', ')}`);

            let filteredCount = 0;
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
                } else {
                  // 记录被过滤的航班
                  filteredCount++;
                  const reason = !destination ? '无目的地' : destination === '未知' ? '目的地为未知' : destination === origin ? '目的地等于出发地' : '其他';
                  this.logger.debug(`⚠️ 航班被过滤 (${reason}): ${flight.origin || origin} → ${destination || '(空)'}`);
                }
              } catch (error) {
                this.logger.error('解析航班失败', error);
              }
            });
            if (filteredCount > 0) {
              this.logger.debug(`📊 过滤统计: 找到 ${possibleFlights.length} 条，过滤 ${filteredCount} 条，保存 ${flights.length} 条`);
            }
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
      if (enableScreenshot) await this.safeScreenshot(page, path.join(this.screenshotDir, `${timestamp}-${origin}-${date}-${cardTypeShort}-final.png`), '最终状态截图');

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
  private async selectOrigin(page: any, origin: string): Promise<boolean> {
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
      const strategy2 = await page.evaluate((cityName: string) => {
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
      const strategy3 = await page.evaluate((cityName: string) => {
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
      const strategy4 = await page.evaluate((cityName: string) => {
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
  private async clickSearchButton(page: any): Promise<boolean> {
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
  private async selectCityFromDropdown(page: any, cityName: string): Promise<boolean> {
    try {
      this.logger.log(`🔍 尝试从下拉列表选择城市: ${cityName}`);

      const citySelected = await page.evaluate((city: string) => {
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
  private async selectCardType(page: any, cardType: string): Promise<boolean> {
    this.logger.log(`🎫 尝试选择权益卡类型: ${cardType}`);

    try {
      // 策略 1: 通过 .search-item 直接点击（针对海南航空页面）
      this.logger.log(`[策略1] 尝试通过 .search-item 选择`);
      const strategy1 = await page.evaluate((targetCardType: string) => {
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
      const strategy2 = await page.evaluate((targetCardType: string) => {
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
        const strategy3 = await page.evaluate((number: string) => {
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
      const strategy4 = await page.evaluate((targetCardType: string, number: string) => {
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
      const strategy5 = await page.evaluate((targetCardType: string) => {
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
   * 日历结构说明：
   * - 日历容器：.hna-calendar-container（滚动式，包含多个月份）
   * - 月份容器：.month-box，id 为 YYYYMM 格式（如 202603）
   * - 日期格子：.cell，有 data-date="YYYYMMDD" 属性
   * - 禁用日期：.cell.disabled
   */
  private async selectDate(page: any, targetDate: string): Promise<boolean> {
    this.logger.log(`📅 尝试选择日期: ${targetDate}`);

    try {
      // 将目标日期转换为 data-date 属性格式（YYYYMMDD）
      const dataDateValue = targetDate.replace(/-/g, '');
      this.logger.log(`目标 data-date: ${dataDateValue}`);

      // 策略 1: 点击日期选择器打开日历
      this.logger.log(`[策略1] 尝试点击日期选择器`);
      const dateBoxClicked = await page.evaluate(() => {
        const el = document.querySelector('.date-box');
        if (el) {
          (el as HTMLElement).click();
          return true;
        }
        return false;
      });

      if (!dateBoxClicked) {
        this.logger.warn('⚠️ 未找到 .date-box，跳过日期选择');
        return true;
      }
      this.logger.log('✅ 日期选择器已点击');

      // 等待日历弹出并渲染
      await page.waitForTimeout(1000);

      // 等待日历容器渲染（最多等待 5 秒）
      let calendarReady = false;
      for (let i = 0; i < 10; i++) {
        const hasCalendar = await page.evaluate(() => {
          return !!document.querySelector('.hna-calendar-container .cell');
        });
        if (hasCalendar) {
          calendarReady = true;
          this.logger.log(`[诊断] 日历已渲染 (等待 ${(i + 1) * 500}ms)`);
          break;
        }
        await page.waitForTimeout(500);
      }

      if (!calendarReady) {
        this.logger.warn('[诊断] 日历未渲染');
        return false;
      }

      // 策略 2: 直接通过 data-date 属性精确选择日期
      this.logger.log(`[策略2] 通过 data-date="${dataDateValue}" 精确选择日期`);
      const dateSelected = await page.evaluate((dataDate: string) => {
        // 通过 data-date 属性精确定位日期格子
        const cell = document.querySelector(`.cell[data-date="${dataDate}"]`);
        if (!cell) {
          console.log(`未找到 data-date="${dataDate}" 的日期格子`);
          return false;
        }

        // 检查是否被禁用
        const isDisabled = cell.classList.contains('disabled') ||
                           cell.classList.contains('past') ||
                           cell.classList.contains('inactive') ||
                           cell.hasAttribute('disabled');

        if (isDisabled) {
          console.log(`日期 ${dataDate} 已被禁用，无法选择`);
          return false;
        }

        // 滚动到该元素并点击
        (cell as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
        (cell as HTMLElement).click();
        console.log(`✓ 点击了日期: ${dataDate}`);
        return true;
      }, dataDateValue);

      if (dateSelected) {
        this.logger.log(`✅ 日期选择成功: ${targetDate}`);
        await page.waitForTimeout(1000);
        return true;
      }

      this.logger.warn(`⚠️ 日期选择失败: ${targetDate} (data-date=${dataDateValue})`);
      return false;

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
  /**
   * 调试爬虫 - 爬取指定出发地和日期的航班
   * 用于诊断特定航线是否缺失问题
   * @param origin 出发地（如：北京首都）
   * @param date 日期（可选，格式：2026-03-19，不提供则爬取明天）
   */
  async debugFlightByDate(origin: string, date?: string): Promise<{
    success: boolean;
    count: number;
    flights: Partial<Flight>[];
    screenshots: string[];
    logs: string[];
  }> {
    // 如果不提供日期，则使用明天
    let crawlDate = date;
    if (!crawlDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      crawlDate = tomorrow.toISOString().split('T')[0];
    }

    this.logger.log(`🔍 开始调试爬虫 (出发地: ${origin}, 日期: ${crawlDate})...`);

    try {
      // 清理之前的截图文件
      this.cleanOldScreenshots();

      // 记录开始时间，用于筛选本次调试的截图
      const startTime = Date.now();

      // 调用爬虫逻辑，不保存到数据库，开启截图
      const { count, flights } = await this.crawlFlights(origin, [crawlDate], true, false, true);

      // 收集本次调试生成的截图（只按时间戳过滤，避免中文文件名编码问题）
      const screenshots = fs.readdirSync(this.screenshotDir)
        .filter(file => {
          if (!file.endsWith('.png')) return false;
          const filePath = path.join(this.screenshotDir, file);
          const stats = fs.statSync(filePath);
          return stats.mtimeMs >= startTime;
        })
        .map(file => path.join(this.screenshotDir, file))
        .sort();

      // 收集本次调试的日志
      const logFile = path.join(process.cwd(), 'logs', `app-${crawlDate}.log`);
      let logs: string[] = [];
      if (fs.existsSync(logFile)) {
        const content = fs.readFileSync(logFile, 'utf-8');
        // 提取与该出发地相关的日志行
        logs = content
          .split('\n')
          .filter(line =>
            line.includes(origin) ||
            line.includes('所有目的地') ||
            line.includes('航班被过滤') ||
            line.includes('过滤统计')
          )
          .slice(-50); // 只返回最后 50 行
      }

      this.logger.log(`✅ 调试完成: 找到 ${count} 条航班, ${screenshots.length} 张截图, ${logs.length} 条日志`);

      return {
        success: true,
        count: count,
        flights: flights,
        screenshots: screenshots,
        logs: logs,
      };
    } catch (error) {
      this.logger.error('调试失败', error);
      return {
        success: false,
        count: 0,
        flights: [],
        screenshots: [],
        logs: [error instanceof Error ? error.message : '未知错误'],
      };
    }
  }

  /**
   * 强制停止当前运行的爬虫任务
   * 释放并发锁，并将所有 running 状态的日志标记为 failed
   */
  async forceStop(): Promise<{ stopped: boolean; taskId: number | null; message: string }> {
    const wasRunning = this.isCrawlerRunning;
    const taskId = this.runningTaskId;

    // 设置停止信号，后台任务会在下一个检查点退出
    this.stopRequested = true;

    // 强制释放锁
    this.isCrawlerRunning = false;
    this.runningTaskId = null;

    // 关闭旧版单浏览器（如果有）
    if (this.browser) {
      try {
        await this.browser.close();
      } catch (e) {
        this.logger.warn('强制停止时关闭浏览器失败', e);
      }
      this.browser = null;
    }

    // 将所有 running 状态的父任务日志标记为 failed
    await this.crawlerLogRepository
      .createQueryBuilder()
      .update()
      .set({
        status: CrawlerTaskStatus.FAILED,
        errorMessage: '任务被手动强制停止',
        endTime: new Date(),
      })
      .where('status = :status AND parentId IS NULL', { status: CrawlerTaskStatus.RUNNING })
      .execute();

    const message = wasRunning
      ? `已强制停止任务（ID: ${taskId}），锁已释放`
      : '当前没有运行中的任务，锁已重置';

    this.logger.warn(`⛔ ${message}`);
    return { stopped: wasRunning, taskId, message };
  }

  /**
   * 创建执行日志
   */
  private async createCrawlerLog(
    taskType: CrawlerTaskType,
    days?: number,
    parentId?: number,
    status: CrawlerTaskStatus = CrawlerTaskStatus.RUNNING,
    details?: string,
  ): Promise<CrawlerLog> {
    const log = this.crawlerLogRepository.create({
      taskType,
      status,
      days,
      parentId: parentId ?? null,
      startTime: status === CrawlerTaskStatus.RUNNING ? new Date() : undefined,
      details: details ?? undefined,
    });

    return this.crawlerLogRepository.save(log) as Promise<CrawlerLog>;
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
   * 优化版：共享单个浏览器实例，信号量控制最大并发 page 数（5个）
   * 所有（机场×日期）任务并发执行，显著提升效率
   * 支持 planOnly 模式：仅返回执行计划，不实际爬取
   */
  async initializeDiscoverAirports(days: number = 1, planOnly = false): Promise<{
    success: boolean;
    taskId?: number;
    airportCount: number;
    flightCount: number;
    executionPlan?: {
      totalDays: number;
      totalTasks: number;
      dateRange: string[];
      estimatedTime: string;
      seedAirports: string[];
      taskList: Array<{
        taskId: number;
        date: string;
        airports: number;
        airportNames: string[];
        estimatedTaskTime: string;
        crawlerInfo: { description: string; expectedFlights: number; maxConcurrency: number };
      }>;
    };
  }> {
    this.logger.log(`🔍 【初始化阶段1】${planOnly ? '生成执行计划' : '开始发现机场'}（爬取未来 ${days} 天）...`);

    const seedAirports = ['北京首都', '北京大兴', '上海浦东', '上海虹桥', '深圳', '广州', '海口', '重庆江北', '西安'];

    // 生成日期范围（从明天开始）
    const dates: string[] = [];
    for (let i = 1; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    // 生成执行计划
    const totalTasks = seedAirports.length * dates.length;
    const estimatedTime = this.calculateEstimatedTime(dates.length, seedAirports.length);
    const taskList = dates.map((date, idx) => ({
      taskId: idx + 1,
      date,
      airports: seedAirports.length,
      airportNames: seedAirports,
      estimatedTaskTime: this.calculateEstimatedTime(1, seedAirports.length),
      crawlerInfo: {
        description: `爬取 ${date} 日期的 ${seedAirports.length} 个种子机场（权益卡：666 + 2666）`,
        expectedFlights: Math.ceil(seedAirports.length * 15),
        maxConcurrency: 5,
      },
    }));

    const executionPlan = {
      totalDays: dates.length,
      totalTasks,
      dateRange: dates,
      estimatedTime,
      seedAirports,
      taskList,
    };

    // planOnly 模式：直接返回计划
    if (planOnly) {
      return { success: true, airportCount: 0, flightCount: 0, executionPlan };
    }

    // 检查并发锁
    if (this.isCrawlerRunning) {
      this.logger.warn(`⚠️ 爬虫已在运行中（任务 ID: ${this.runningTaskId}），新任务被拒绝`);
      return { success: false, airportCount: 0, flightCount: 0 };
    }

    const log = await this.createCrawlerLog(CrawlerTaskType.DISCOVER_AIRPORTS, days);
    // 立即写入 dateRange，执行中即可显示
    await this.updateCrawlerLog(log.id, {
      details: JSON.stringify({ dateRange: dates, seedAirports }),
    });
    this.stopRequested = false;
    this.isCrawlerRunning = true;
    this.runningTaskId = log.id;

    // 异步模式：立即返回 taskId，后台执行
    this.logger.log(`⏳ 异步模式：立即返回任务 ID ${log.id}，后台执行中...`);
    setImmediate(() => {
      this.executeDiscoverAirportsBackground(log.id, days, seedAirports, dates, executionPlan).catch(error => {
        this.logger.error('发现机场后台执行异常', error);
      });
    });

    return { success: true, taskId: log.id, airportCount: 0, flightCount: 0, executionPlan };
  }

  /**
   * 后台执行发现机场任务
   */
  private async executeDiscoverAirportsBackground(
    logId: number,
    days: number,
    seedAirports: string[],
    dates: string[],
    executionPlan: any,
  ): Promise<void> {
    // 独立浏览器实例（不使用 this.browser，避免与其他任务冲突）
    let browser: any | null = null;

    try {
      // 生成所有（机场, 日期）任务组合（seedAirports/dates 已在上方生成）
      const tasks: Array<{ airport: string; date: string }> = [];
      for (const airport of seedAirports) {
        for (const date of dates) {
          tasks.push({ airport, date });
        }
      }

      this.logger.log(`🚀 共 ${tasks.length} 个任务（${seedAirports.length} 机场 × ${dates.length} 天），最大并发 ${CrawlerService.DISCOVER_AIRPORTS_PAGE_CONCURRENCY}`);

      // 启动共享浏览器
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });
      this.logger.log('🌐 共享浏览器已启动');

      // 信号量：最多 DISCOVER_AIRPORTS_PAGE_CONCURRENCY 个 page 同时运行
      const MAX_CONCURRENT = CrawlerService.DISCOVER_AIRPORTS_PAGE_CONCURRENCY;
      let running = 0;
      let taskIndex = 0;
      const allFlights: Partial<Flight>[] = [];
      const taskResults: Record<string, number> = {};

      await new Promise<void>((resolve, reject) => {
        const runNext = () => {
          // 收到停止信号：等当前运行完成后退出
          if (this.stopRequested && running === 0) {
            this.logger.warn(`⛔ [发现机场] 收到停止信号，已退出`);
            resolve();
            return;
          }
          // 所有任务完成
          if (taskIndex >= tasks.length && running === 0) {
            resolve();
            return;
          }
          // 填满并发槽
          while (!this.stopRequested && running < MAX_CONCURRENT && taskIndex < tasks.length) {
            const { airport, date } = tasks[taskIndex++];
            running++;

            this.crawlSinglePageWithBrowser(browser!, airport, date)
              .then(flights => {
                const key = `${airport}@${date}`;
                taskResults[key] = flights.length;
                allFlights.push(...flights);
                this.logger.log(`  ✅ ${airport} / ${date}: ${flights.length} 条`);
              })
              .catch(err => {
                const key = `${airport}@${date}`;
                taskResults[key] = 0;
                this.logger.warn(`  ⚠️ ${airport} / ${date}: 失败 - ${err.message}`);
              })
              .finally(() => {
                running--;
                runNext();
              });
          }
        };
        runNext();
      });

      this.logger.log(`📊 全部任务完成，共爬取 ${allFlights.length} 条航班`);

      // 一次性替换数据
      if (allFlights.length > 0) {
        this.logger.log(`🔄 替换数据：删除旧数据并保存 ${allFlights.length} 条新数据...`);
        const deletedCount = await this.flightService.deleteDiscoveryFlights(dates);
        this.logger.log(`🗑️ 已删除 ${deletedCount} 条旧数据`);
        await this.flightService.saveFlights(allFlights);
        this.logger.log(`✅ 已保存 ${allFlights.length} 条新数据`);
      }

      // 从航班数据中自动发现机场
      if (allFlights.length > 0) {
        await this.flightService.discoverAirportsFromFlights(allFlights);
      } else {
        this.logger.warn('⚠️ 本次爬取未获得任何航班数据，跳过机场发现');
      }

      // 获取发现的机场数量
      const airports = await this.flightService.getEnabledOriginAirports();

      this.logger.log(`✅ 【初始化阶段1】完成！发现 ${airports.length} 个机场`);
      this.logger.log(`📋 机场列表: ${airports.join(', ')}`);
      this.logger.log(`📊 本次爬取航班数: ${allFlights.length} 条`);

      await this.completeCrawlerLog(logId, true, {
        airportCount: airports.length,
        flightCount: allFlights.length,
        details: {
          seedAirports,
          taskResults,
          discoveredAirports: airports,
          dateRange: dates,
        },
      });
    } catch (error) {
      this.logger.error('❌ 【初始化阶段1】失败', error);
      await this.completeCrawlerLog(logId, false, {
        airportCount: 0,
        flightCount: 0,
        errorMessage: error instanceof Error ? error.message : '未知错误',
      });
    } finally {
      // 关闭独立浏览器
      if (browser) {
        try { await browser.close(); } catch (e) { /* ignore */ }
      }
      // 释放并发锁
      this.isCrawlerRunning = false;
      this.runningTaskId = null;
      this.logger.log('🔓 爬虫锁已释放');
    }
  }

  /**
   * 用外部传入的浏览器实例爬取单个（机场, 日期）组合
   * 直接委托给 crawlFlightsByDate，传入 externalBrowser 参数
   */
  private async crawlSinglePageWithBrowser(
    browser: any,
    origin: string,
    date: string,
  ): Promise<Partial<Flight>[]> {
    const cardTypes = ['666权益卡航班', '2666权益卡航班'];
    return this.crawlFlightsByDate(origin, date, cardTypes, browser);
  }

  /**
   * 发现航班方法 - 按日期区间查询
   * 核心特性：每个任务只爬取一天的数据，所有任务并行执行
   *
   * 使用示例：
   * { startDate: "2026-03-18", endDate: "2026-03-25" } - 爬取指定日期范围
   * { startDate: "2026-03-18", endDate: "2026-03-25", planOnly: true } - 仅返回执行计划，不执行爬虫
   */
  async initializeRefreshFlightsByDateRange(options: {
    startDate: string;
    endDate: string;
    planOnly?: boolean;
    async?: boolean;
  }): Promise<{
    success: boolean;
    taskId?: number;
    executionPlan: {
      totalDays: number;
      totalTasks: number;
      dateRange: string[];
      estimatedTime: string;
      totalAirports: number;
      airportList: string[];
      taskList: Array<{
        taskId: number;
        date: string;
        airports: number;
        airportNames: string[];
        estimatedTaskTime: string;
        crawlerInfo: {
          description: string;
          expectedFlights: number;
          maxConcurrency: number;
        };
      }>;
    };
    executionResult?: {
      success: boolean;
      totalCount: number;
      successTasks: number;
      failedTasks: number;
      taskDetails: Array<{ taskId: number; date: string; success: boolean; count: number }>;
    };
  }> {
    this.logger.log(`🔄 【发现航班】按日期区间 ${options.startDate} ~ ${options.endDate}...`);

    // 计算日期列表（按日期区间）
    const dates: string[] = [];
    const start = new Date(options.startDate);
    const end = new Date(options.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }

    // 获取启用的机场
    const airports = await this.flightService.getEnabledOriginAirports();
    if (airports.length === 0) {
      this.logger.warn('⚠️ 没有可用的机场，请先执行【初始化阶段1】发现机场');
      return {
        success: false,
        executionPlan: {
          totalDays: dates.length,
          totalTasks: dates.length,
          dateRange: dates,
          estimatedTime: '无',
          totalAirports: 0,
          airportList: [],
          taskList: [],
        },
      };
    }

    // 生成执行计划 - 包含详细的城市和爬虫启动信息
    const airportNames = airports;
    const estimatedTime = this.calculateEstimatedTime(dates.length, airports.length);

    const taskList = dates.map((date, idx) => {
      const taskId = idx + 1;
      const estimatedTaskTime = this.calculateEstimatedTime(1, airports.length);

      return {
        taskId,
        date,
        airports: airports.length,
        airportNames: airports,
        estimatedTaskTime,
        crawlerInfo: {
          description: `爬取 ${date} 日期的 ${airports.length} 个机场的航班数据（权益卡：666 + 2666）`,
          expectedFlights: Math.ceil(airports.length * 2.5), // 每个机场预期 2-3 班航班
          maxConcurrency: CrawlerService.REFRESH_FLIGHTS_AIRPORT_CONCURRENCY,
        },
      };
    });

    const executionPlan = {
      totalDays: dates.length,
      totalTasks: dates.length,
      dateRange: dates,
      estimatedTime,
      totalAirports: airports.length,
      airportList: airportNames,
      dateConcurrency: CrawlerService.REFRESH_FLIGHTS_DATE_CONCURRENCY,
      airportConcurrency: CrawlerService.REFRESH_FLIGHTS_AIRPORT_CONCURRENCY,
      taskList,
    };

    this.logger.log(`📋 执行计划生成完毕：${dates.length} 个任务，${airports.length} 个机场，预计 ${estimatedTime}`);

    // 如果仅获取计划，直接返回
    if (options.planOnly) {
      return {
        success: true,
        executionPlan,
      };
    }

    // 检查并发锁
    if (this.isCrawlerRunning) {
      this.logger.warn(`⚠️ 爬虫已在运行中（任务 ID: ${this.runningTaskId}），新任务被拒绝`);
      return {
        success: false,
        executionPlan,
      };
    }

    // 创建主日志记录（用于跟踪整个执行过程）
    const mainLog = await this.createCrawlerLog(CrawlerTaskType.REFRESH_FLIGHTS, dates.length);
    // 立即写入 dateRange，执行中即可显示
    await this.updateCrawlerLog(mainLog.id, {
      details: JSON.stringify({ dateRange: dates, totalAirports: airports.length }),
    });

    // 获取并发锁
    this.stopRequested = false;
    this.isCrawlerRunning = true;
    this.runningTaskId = mainLog.id;

    // 异步模式：立即返回，后台执行
    if (options.async) {
      this.logger.log(`⏳ 异步模式：立即返回任务 ID ${mainLog.id}，后台执行中...`);

      // 使用 setImmediate 在下一个事件循环执行，避免阻塞响应
      setImmediate(() => {
        this.executeRefreshFlightsBackground(mainLog.id, dates, airports, executionPlan).catch(error => {
          this.logger.error('后台执行异常', error);
        });
      });

      return {
        success: true,
        taskId: mainLog.id,
        executionPlan,
      };
    }

    // 同步模式：等待执行完成（向后兼容）
    try {
      // 执行所有日期任务（分批并行）
      const MAX_CONCURRENT_TASKS = CrawlerService.REFRESH_FLIGHTS_DATE_CONCURRENCY;
      const taskResults: Array<{ taskId: number; date: string; success: boolean; count: number }> = [];
      let totalCount = 0;

      this.logger.log(`📋 [父任务 #${mainLog.id}] 开始执行：${dates.length} 天 × ${airports.length} 个机场`);

      for (let i = 0; i < dates.length; i += MAX_CONCURRENT_TASKS) {
        const batch = dates.slice(i, i + MAX_CONCURRENT_TASKS);
        const batchIndex = Math.floor(i / MAX_CONCURRENT_TASKS) + 1;
        const totalBatches = Math.ceil(dates.length / MAX_CONCURRENT_TASKS);

        this.logger.log(`├─ [批次 ${batchIndex}/${totalBatches}] ${batch.join(', ')}`);

        const batchPromises = batch.map((date, idx) =>
          this.executeDailyTask(date, airports, i + idx + 1, mainLog.id)
            .then(result => {
              taskResults.push(result);
              totalCount += result.count;
              return result;
            })
            .catch(error => {
              this.logger.error(`  ├─ [子任务 ${i + idx + 1}] ❌ ${date} 失败`, error);
              const failedResult = { taskId: i + idx + 1, date, success: false, count: 0 };
              taskResults.push(failedResult);
              return failedResult;
            })
        );

        await Promise.all(batchPromises);
      }

      // 排序结果（按任务 ID）
      taskResults.sort((a, b) => a.taskId - b.taskId);

      const successCount = taskResults.filter(t => t.success).length;
      const failedCount = taskResults.filter(t => !t.success).length;

      this.logger.log(`└─ [父任务 #${mainLog.id}] ✅ 全部完成：${successCount} 成功 / ${failedCount} 失败，共 ${totalCount} 条航班`);

      // 更新主日志
      await this.completeCrawlerLog(mainLog.id, failedCount === 0, {
        airportCount: airports.length,
        flightCount: totalCount,
        details: {
          executionPlan,
          taskResults,
        },
      });

      return {
        success: failedCount === 0,
        executionPlan,
        executionResult: {
          success: failedCount === 0,
          totalCount,
          successTasks: successCount,
          failedTasks: failedCount,
          taskDetails: taskResults,
        },
      };
    } finally {
      // 释放并发锁
      this.isCrawlerRunning = false;
      this.runningTaskId = null;
      this.logger.log('🔓 爬虫锁已释放');
    }
  }

  /**
   * 执行单个日期的爬取任务
   * 特点：数据隔离清晰，每个任务只操作一天的数据
   */
  private async executeDailyTask(
    date: string,
    airports: string[],
    taskId: number,
    parentLogId?: number,
    existingLogId?: number,
  ): Promise<{ taskId: number; date: string; success: boolean; count: number }> {
    this.logger.log(`  ├─ [子任务 ${taskId}] 启动 ${date}（${airports.length} 个机场）`);

    let logId: number;
    if (existingLogId) {
      // 使用预创建的日志，将状态从 PENDING 改为 RUNNING
      logId = existingLogId;
      await this.updateCrawlerLog(logId, {
        status: CrawlerTaskStatus.RUNNING,
        startTime: new Date(),
      });
    } else {
      const log = await this.createCrawlerLog(CrawlerTaskType.REFRESH_FLIGHTS_DAILY, 1, parentLogId);
      logId = log.id;
      // 立即写入具体日期，执行中即可显示
      await this.updateCrawlerLog(logId, {
        details: JSON.stringify({ dateRange: [date], totalAirports: airports.length }),
      });
    }
    let browser: any | null = null;

    const launchBrowser = () => puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      protocolTimeout: 60000,
    });

    try {
      // 每个子任务独立浏览器，由父任务控制并发数（MAX_CONCURRENT_DATES）
      browser = await launchBrowser();

      // 信号量：最多 REFRESH_FLIGHTS_AIRPORT_CONCURRENCY 个 page 同时运行
      const MAX_CONCURRENT = CrawlerService.REFRESH_FLIGHTS_AIRPORT_CONCURRENCY;
      let running = 0;
      let airportIndex = 0;
      let totalSaved = 0;
      let totalDeleted = 0;
      const failedAirports: string[] = [];

      // 浏览器崩溃检测：Connection closed 或 Target.createTarget timed out
      const isBrowserCrashError = (msg: string) =>
        msg.includes('Connection closed') || msg.includes('Target.createTarget timed out');

      // 重建浏览器（最多重试 2 次）
      let browserRestartCount = 0;
      const MAX_BROWSER_RESTARTS = 2;
      const restartBrowser = async (): Promise<boolean> => {
        if (browserRestartCount >= MAX_BROWSER_RESTARTS) {
          this.logger.error(`  ├─ [子任务 ${taskId}] 浏览器已重建 ${browserRestartCount} 次，放弃`);
          return false;
        }
        browserRestartCount++;
        this.logger.warn(`  ├─ [子任务 ${taskId}] 🔄 浏览器崩溃，重建中（第 ${browserRestartCount} 次）...`);
        try { await browser?.close(); } catch { /* ignore */ }
        await new Promise(r => setTimeout(r, 2000)); // 等 2 秒再重建
        browser = await launchBrowser();
        this.logger.log(`  ├─ [子任务 ${taskId}] ✅ 浏览器重建成功`);
        return true;
      };

      // 待重试队列（浏览器崩溃后放入此队列）
      const retryQueue: string[] = [];

      await new Promise<void>((resolve, reject) => {
        const runNext = () => {
          if (this.stopRequested && running === 0) {
            this.logger.warn(`⛔ [子任务 ${taskId}/${date}] 收到停止信号，已退出`);
            resolve();
            return;
          }
          // 合并重试队列和剩余队列
          const pendingAirports = [...retryQueue.splice(0), ...airports.slice(airportIndex)];
          if (pendingAirports.length === 0 && airportIndex >= airports.length && running === 0) {
            resolve();
            return;
          }
          if (airportIndex >= airports.length && retryQueue.length === 0 && running === 0) {
            resolve();
            return;
          }
          while (!this.stopRequested && running < MAX_CONCURRENT && (airportIndex < airports.length || retryQueue.length > 0)) {
            const airport = retryQueue.length > 0 ? retryQueue.shift()! : airports[airportIndex++];
            running++;

            this.crawlSinglePageWithBrowser(browser!, airport, date)
              .then(async flights => {
                // 爬取成功：删旧存新
                const deleted = await this.flightService.deleteFlightsByOriginAndDate(airport, date);
                if (flights.length > 0) {
                  await this.flightService.saveFlights(flights);
                }
                this.logger.log(`  │  │  ✅ ${airport}: 删 ${deleted} 旧，存 ${flights.length} 新`);
                totalSaved += flights.length;
                totalDeleted += deleted;
              })
              .catch(async err => {
                if (isBrowserCrashError(err.message)) {
                  // 浏览器崩溃：尝试重建，并将该机场放入重试队列
                  const restarted = await restartBrowser();
                  if (restarted) {
                    this.logger.warn(`  │  │  🔁 ${airport}: 浏览器崩溃，加入重试队列`);
                    retryQueue.push(airport);
                  } else {
                    this.logger.warn(`  │  │  ⚠️ ${airport}: 浏览器重建失败，放弃`);
                    failedAirports.push(airport);
                  }
                } else {
                  // 其他错误：保留旧数据不动
                  this.logger.warn(`  │  │  ⚠️ ${airport}: 失败，保留旧数据（${err.message}）`);
                  failedAirports.push(airport);
                }
              })
              .finally(() => {
                running--;
                runNext();
              });
          }
        };
        runNext();
      });

      const successAirports = airports.length - failedAirports.length;
      this.logger.log(`  ├─ [子任务 ${taskId}] ✅ ${date} 完成：${successAirports}/${airports.length} 机场成功，删 ${totalDeleted} 旧，存 ${totalSaved} 新${failedAirports.length > 0 ? `，失败保留：${failedAirports.join(', ')}` : ''}`);

      await this.completeCrawlerLog(logId, true, {
        airportCount: airports.length,
        flightCount: totalSaved,
        details: { date, taskId, airports, failedAirports, totalDeleted, totalSaved },
        errorMessage: failedAirports.length > 0
          ? `${failedAirports.length} 个机场爬取失败（旧数据已保留）：${failedAirports.join(', ')}`
          : undefined,
      });

      return { taskId, date, success: true, count: totalSaved };
    } catch (error) {
      this.logger.error(`  ├─ [子任务 ${taskId}] ❌ ${date} 异常`, error);
      await this.completeCrawlerLog(logId, false, {
        airportCount: airports.length,
        flightCount: 0,
        errorMessage: error instanceof Error ? error.message : '未知错误',
      });
      return { taskId, date, success: false, count: 0 };
    } finally {
      if (browser) {
        try { await browser.close(); } catch (e) { /* ignore */ }
      }
    }
  }

  /**
   * 后台执行航班发现任务（异步模式）
   * 不阻塞响应，在后台执行所有日期任务
   */
  private async executeRefreshFlightsBackground(
    mainLogId: number,
    dates: string[],
    airports: string[],
    executionPlan: any,
  ): Promise<void> {
    // 确保停止信号已清除（防止上次 forceStop 的残留信号影响本次任务）
    this.stopRequested = false;
    this.logger.log(`📋 [父任务 #${mainLogId}] 后台开始执行：${dates.length} 天 × ${airports.length} 个机场`);

    try {
      // 预创建所有子任务日志记录（状态为 PENDING），让前端能立即看到完整任务列表
      const pendingLogIds: number[] = [];
      for (let i = 0; i < dates.length; i++) {
        const pendingLog = await this.createCrawlerLog(
          CrawlerTaskType.REFRESH_FLIGHTS_DAILY,
          1,
          mainLogId,
          CrawlerTaskStatus.PENDING,
          JSON.stringify({ dateRange: [dates[i]], totalAirports: airports.length }),
        );
        pendingLogIds.push(pendingLog.id);
      }
      this.logger.log(`📝 [父任务 #${mainLogId}] 预创建 ${dates.length} 个子任务记录`);

      // 日期子任务并行执行，每个子任务独立浏览器，最多 REFRESH_FLIGHTS_DATE_CONCURRENCY 个同时运行
      const MAX_CONCURRENT_DATES = CrawlerService.REFRESH_FLIGHTS_DATE_CONCURRENCY;
      const taskResults: Array<{ taskId: number; date: string; success: boolean; count: number }> = [];
      let totalCount = 0;
      let dateIndex = 0;
      let running = 0;

      this.logger.log(`🚀 [父任务 #${mainLogId}] 最多 ${MAX_CONCURRENT_DATES} 个日期并行，每日 ${CrawlerService.REFRESH_FLIGHTS_AIRPORT_CONCURRENCY} 个机场并发`);

      await new Promise<void>((resolve, reject) => {
        const runNext = () => {
          // 收到停止信号：等待当前运行的子任务完成后退出，不再启动新任务
          if (this.stopRequested && running === 0) {
            this.logger.warn(`⛔ [父任务 #${mainLogId}] 收到停止信号，已退出`);
            resolve();
            return;
          }
          if (dateIndex >= dates.length && running === 0) {
            resolve();
            return;
          }
          while (!this.stopRequested && running < MAX_CONCURRENT_DATES && dateIndex < dates.length) {
            const date = dates[dateIndex];
            const taskId = dateIndex + 1;
            const existingLogId = pendingLogIds[dateIndex];
            dateIndex++;
            running++;

            this.logger.log(`├─ [子任务 ${taskId}/${dates.length}] 开始 ${date}`);

            this.executeDailyTask(date, airports, taskId, mainLogId, existingLogId)
              .then(result => {
                taskResults.push(result);
                totalCount += result.count;
              })
              .catch(error => {
                this.logger.error(`  ├─ [子任务 ${taskId}] ❌ ${date} 失败`, error);
                taskResults.push({ taskId, date, success: false, count: 0 });
              })
              .finally(() => {
                running--;
                runNext();
              });
          }
        };
        runNext();
      });

      // 将剩余 PENDING 子任务（未执行就停止的）标记为 FAILED
      if (this.stopRequested && dateIndex < dates.length) {
        const cancelledIds = pendingLogIds.slice(dateIndex);
        for (const cid of cancelledIds) {
          await this.crawlerLogRepository.update(cid, {
            status: CrawlerTaskStatus.FAILED,
            errorMessage: '任务被停止，未执行',
            endTime: new Date(),
          });
        }
        this.logger.warn(`⛔ [父任务 #${mainLogId}] 取消 ${cancelledIds.length} 个未执行子任务`);
      }

      // 排序结果（按任务 ID）
      taskResults.sort((a, b) => a.taskId - b.taskId);

      const successCount = taskResults.filter(t => t.success).length;
      const failedCount = taskResults.filter(t => !t.success).length;

      this.logger.log(`└─ [父任务 #${mainLogId}] ✅ 后台完成：${successCount} 成功 / ${failedCount} 失败，共 ${totalCount} 条航班`);

      // 更新主日志
      await this.completeCrawlerLog(mainLogId, failedCount === 0, {
        airportCount: airports.length,
        flightCount: totalCount,
        details: {
          executionPlan,
          taskResults,
        },
      });
    } catch (error) {
      this.logger.error(`❌ 后台执行异常`, error);

      // 记录失败
      await this.completeCrawlerLog(mainLogId, false, {
        airportCount: airports.length,
        flightCount: 0,
        errorMessage: error instanceof Error ? error.message : '未知错误',
      });
    } finally {
      // 释放并发锁
      this.isCrawlerRunning = false;
      this.runningTaskId = null;
      this.logger.log('🔓 后台执行：爬虫锁已释放');
    }
  }

  /**
   * 计算预估执行时间
   */
  private calculateEstimatedTime(totalDays: number, airportCount: number): string {
    // 直接从执行常量推导，修改并发度时预估自动更新：
    // 总耗时 = 日期批次数 × 机场批次数 × 单机场耗时
    const dateBatches = Math.ceil(totalDays / CrawlerService.REFRESH_FLIGHTS_DATE_CONCURRENCY);
    const airportBatches = Math.ceil(airportCount / CrawlerService.REFRESH_FLIGHTS_AIRPORT_CONCURRENCY);
    const totalSeconds = dateBatches * airportBatches * CrawlerService.SECONDS_PER_AIRPORT;
    const totalMinutes = Math.ceil(totalSeconds / 60);

    if (totalMinutes < 1) return '小于 1 分钟';
    if (totalMinutes < 60) return `约 ${totalMinutes} 分钟`;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return mins > 0 ? `约 ${hours} 小时 ${mins} 分钟` : `约 ${hours} 小时`;
  }


  /**
   * 根据日期列表执行爬取任务（不检查并发锁，用于并行执行）
   * @param dates 日期列表（格式：["2026-03-20", "2026-03-21", ...]）
   */
  private async executeTaskByDateList(
    dates: string[],
  ): Promise<{ success: boolean; count: number }> {
    this.logger.log(`🔄 【子任务】开始爬取 ${dates.length} 天: ${dates[0]} 至 ${dates[dates.length - 1]}`);

    // 创建执行日志
    const log = await this.createCrawlerLog(CrawlerTaskType.REFRESH_FLIGHTS, dates.length);

    try {
      // 获取所有启用爬虫的机场
      const airports = await this.flightService.getEnabledOriginAirports();

      if (airports.length === 0) {
        this.logger.warn('⚠️ 没有可用的机场');
        await this.completeCrawlerLog(log.id, false, {
          airportCount: 0,
          flightCount: 0,
          errorMessage: '没有可用的机场',
        });
        return { success: false, count: 0 };
      }

      this.logger.log(`📋 [子任务] 准备爬取 ${airports.length} 个机场`);

      // 并行爬取所有机场
      const CONCURRENT_LIMIT = 5;
      let totalCount = 0;
      const airportResults: Record<string, number> = {};
      const allCollectedFlights: Partial<Flight>[] = [];

      for (let i = 0; i < airports.length; i += CONCURRENT_LIMIT) {
        const batch = airports.slice(i, i + CONCURRENT_LIMIT);

        const batchPromises = batch.map(airport =>
          this.crawlFlights(airport, dates, true, false)
            .then(({ count, flights }) => {
              airportResults[airport] = count;
              allCollectedFlights.push(...flights);
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

      // 删除本任务日期范围的旧数据并保存新数据
      this.logger.log(`🔄 [子任务] 开始替换数据：删除 ${dates[0]} 至 ${dates[dates.length - 1]} 的旧数据...`);

      // 先删除本任务日期范围的旧数据（无论是否爬到新数据）
      const deletedCount = await this.flightService.deleteDiscoveryFlights(dates);
      this.logger.log(`🗑️ [子任务] 已删除 ${deletedCount} 条旧数据（日期范围: ${dates[0]} ~ ${dates[dates.length - 1]}）`);

      // 如果爬到了新数据，则保存
      if (allCollectedFlights.length > 0) {
        await this.flightService.saveFlights(allCollectedFlights);
        this.logger.log(`✅ [子任务] 已保存 ${allCollectedFlights.length} 条新数据`);
      } else {
        this.logger.warn(`⚠️ [子任务] 未爬取到数据，已清空该日期范围的旧数据`);
      }

      // 完成日志
      await this.completeCrawlerLog(log.id, true, {
        airportCount: airports.length,
        flightCount: totalCount,
        details: {
          airports,
          airportResults,
          dateRange: dates,
        },
      });

      return { success: true, count: totalCount };
    } catch (error) {
      this.logger.error('❌ [子任务] 失败', error);
      await this.completeCrawlerLog(log.id, false, {
        airportCount: 0,
        flightCount: 0,
        errorMessage: error.message || '未知错误',
      });
      return { success: false, count: 0 };
    }
  }

  /**
   * 执行周任务（不检查并发锁，用于并行执行）
   * @param startDay 开始天数
   * @param days 爬取天数
   */
  private async executeWeekTaskWithoutLock(
    startDay: number,
    days: number,
  ): Promise<{ success: boolean; count: number }> {
    this.logger.log(`🔄 【子任务】开始爬取第 ${startDay} 天起，共 ${days} 天...`);

    // 创建执行日志
    const log = await this.createCrawlerLog(CrawlerTaskType.REFRESH_FLIGHTS, days);

    try {
      // 获取所有启用爬虫的机场
      const airports = await this.flightService.getEnabledOriginAirports();

      if (airports.length === 0) {
        this.logger.warn('⚠️ 没有可用的机场');
        await this.completeCrawlerLog(log.id, false, {
          airportCount: 0,
          flightCount: 0,
          errorMessage: '没有可用的机场',
        });
        return { success: false, count: 0 };
      }

      // 生成日期范围
      const dates: string[] = [];
      for (let i = startDay; i < startDay + days; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }

      this.logger.log(`📋 [子任务] 日期: ${dates[0]} 至 ${dates[dates.length - 1]}`);

      // 并行爬取所有机场
      const CONCURRENT_LIMIT = 5;
      let totalCount = 0;
      const airportResults: Record<string, number> = {};
      const allCollectedFlights: Partial<Flight>[] = [];

      for (let i = 0; i < airports.length; i += CONCURRENT_LIMIT) {
        const batch = airports.slice(i, i + CONCURRENT_LIMIT);

        const batchPromises = batch.map(airport =>
          this.crawlFlights(airport, dates, true, false)
            .then(({ count, flights }) => {
              airportResults[airport] = count;
              allCollectedFlights.push(...flights);
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

      // 删除本任务日期范围的旧数据并保存新数据
      this.logger.log(`🔄 [子任务] 开始替换数据：删除 ${dates[0]} 至 ${dates[dates.length - 1]} 的旧数据...`);

      // 先删除本任务日期范围的旧数据（无论是否爬到新数据）
      const deletedCount = await this.flightService.deleteDiscoveryFlights(dates);
      this.logger.log(`🗑️ [子任务] 已删除 ${deletedCount} 条旧数据（日期范围: ${dates[0]} ~ ${dates[dates.length - 1]}）`);

      // 如果爬到了新数据，则保存
      if (allCollectedFlights.length > 0) {
        await this.flightService.saveFlights(allCollectedFlights);
        this.logger.log(`✅ [子任务] 已保存 ${allCollectedFlights.length} 条新数据`);
      } else {
        this.logger.warn(`⚠️ [子任务] 未爬取到数据，已清空该日期范围的旧数据`);
      }

      // 完成日志
      await this.completeCrawlerLog(log.id, true, {
        airportCount: airports.length,
        flightCount: totalCount,
        details: {
          airports,
          airportResults,
          dateRange: dates,
          startDay,
        },
      });

      return { success: true, count: totalCount };
    } catch (error) {
      this.logger.error('❌ [子任务] 失败', error);
      await this.completeCrawlerLog(log.id, false, {
        airportCount: 0,
        flightCount: 0,
        errorMessage: error.message || '未知错误',
      });
      return { success: false, count: 0 };
    }
  }

  /**
   * 带偏移量的发现航班任务（按周拆分的核心方法）
   * @param startDay 开始天数（1 表示明天，2 表示后天）
   * @param days 爬取天数
   */
  /**
   * 手动触发爬虫（用于测试）- 执行完整的两阶段初始化
   * 默认爬取未来 7 天的航班数据
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
      }

      // 阶段2：发现航班数据（默认未来 7 天）
      this.logger.log('🔄 开始发现航班数据（未来 7 天）...');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      const result = await this.initializeRefreshFlightsByDateRange({
        startDate: tomorrow.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        async: false,
      });

      return {
        success: result.success,
        count: result.executionResult?.totalCount || 0,
      };
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
   * 每小时清理过期缓存
   */
  @Cron('0 * * * *', {
    name: 'clean-expired-cache',
    timeZone: 'Asia/Shanghai',
  })
  async scheduledCleanExpiredCache() {
    this.logger.log('⏰ 定时任务：开始清理过期缓存');
    try {
      await this.routeService.cleanExpiredCache();
    } catch (error) {
      this.logger.error('❌ 清理过期缓存失败', error);
    }
  }

  /**
   * 每小时刷新所有城市的目的地查询缓存
   * 刷新内容：destinations 缓存 + transfer 缓存
   */
  @Cron('7 * * * *', {
    name: 'refresh-destination-cache',
    timeZone: 'Asia/Shanghai',
  })
  async scheduledRefreshDestinationCache() {
    this.logger.log('⏰ 定时缓存刷新：开始刷新所有城市目的地查询缓存');

    // 获取所有城市
    const { cityList } = await this.flightService.getAvailableCities();
    if (cityList.length === 0) {
      this.logger.warn('⚠️ 无城市数据，跳过缓存刷新');
      return;
    }

    // 与前端 getDefaultDateRange() 保持一致：今天 ~ 今天+1个月
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    const startDate = fmt(today);
    const endDate = fmt(nextMonth);

    this.logger.log(`📋 共 ${cityList.length} 个城市待刷新，日期范围 ${startDate} ~ ${endDate}，并发度 3`);

    let successCount = 0;
    let failCount = 0;

    // 并发度 3：每个城市需做 destinations + transfer 两次重计算，避免压垮数据库
    const CONCURRENCY = 3;
    let i = 0;
    const run = async () => {
      while (i < cityList.length) {
        const city = cityList[i++];
        try {
          // 删除旧缓存
          const destCacheList = await this.flightService.listQueryCache({ type: 'destinations' });
          const keysToDelete = destCacheList.list
            .filter(c => c.cacheKey.startsWith(`destinations|${city}|`))
            .map(c => c.cacheKey);
          if (keysToDelete.length > 0) {
            await this.flightService.deleteCacheByKeys(keysToDelete);
          }
          await this.routeService.clearTransferCacheByOrigin(city);

          // 重新查询（自动写入新缓存，key 与前端默认日期一致，首次加载直接命中）
          await this.flightService.queryDestinations({
            origin: city,
            startDate,
            endDate,
            includeReturn: true,
          });
          await this.routeService.discoverTransferDestinations({
            origin: city,
            departureDate: startDate,
            endDate,
            maxTransfers: 1,
          });

          this.logger.log(`✅ [${successCount + failCount + 1}/${cityList.length}] ${city} 缓存刷新完成`);
          successCount++;
        } catch (error) {
          this.logger.warn(`⚠️ ${city} 缓存刷新失败: ${error.message}`);
          failCount++;
        }
      }
    };

    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, cityList.length) }, run));
    this.logger.log(`⏰ 缓存刷新完成：${successCount} 成功 / ${failCount} 失败`);
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

    // 只返回父任务（parentId 为 null）
    queryBuilder.andWhere('log.parentId IS NULL');

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
   * 查询某父任务的所有子任务日志
   */
  async getSubLogs(parentId: number): Promise<CrawlerLog[]> {
    return this.crawlerLogRepository.find({
      where: { parentId },
      order: { createdAt: 'ASC' },
    });
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
