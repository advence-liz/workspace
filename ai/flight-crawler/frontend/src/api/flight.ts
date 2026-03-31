import api from './index';

export interface QueryFlightsParams {
  origin: string;
  destination?: string;
  startDate: string;
  endDate: string;
  flightType?: '666权益卡航班' | '2666权益卡航班';
}

export interface DestinationResult {
  destination: string;
  flightCount: number;
  availableDates: string[];
  cardTypes: string[];
  hasReturn: boolean;
  returnFlightCount?: number;
  returnAvailableDates?: string[];
}

export interface DestinationsResponse {
  destinations: DestinationResult[];
  totalCount: number;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface Flight {
  id: number;
  flightNo: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  availableSeats?: number;
  aircraftType?: string;
  cardType: string;
  crawledAt?: string;
}

// 查询所有可达目的地
export const queryDestinations = (
  params: QueryFlightsParams & { includeReturn?: boolean }
): Promise<DestinationsResponse> => {
  return api.get('/flights/destinations', { params });
};


// 获取所有可用的城市列表
export const getAvailableCities = (): Promise<{ origins: string[]; destinations: string[]; cityList: string[]; minDate: string | null; maxDate: string | null }> => {
  return api.get('/flights/cities');
};

// 发现机场执行计划类型
export interface DiscoverAirportsExecutionPlan {
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
}

// 初始化阶段1：发现机场
export const initializeDiscoverAirports = (options: { days?: number; planOnly?: boolean }): Promise<{
  success: boolean;
  airportCount: number;
  flightCount: number;
  message: string;
  executionPlan?: DiscoverAirportsExecutionPlan;
}> => {
  return api.post('/crawler/initialize/discover', options);
};

// 初始化阶段2：发现航班数据（按日期区间）
// 使用示例：
// 1. 执行爬虫：initializeDiscoverFlights({ startDate: "2026-03-18", endDate: "2026-03-25" })
// 2. 仅获取计划：initializeDiscoverFlights({ startDate: "2026-03-18", endDate: "2026-03-25", planOnly: true })
export const initializeDiscoverFlights = (options: {
  startDate: string;
  endDate: string;
  planOnly?: boolean;
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
}> => {
  return api.post('/crawler/initialize/refresh', options);
};


// 执行日志相关接口
export interface CrawlerLog {
  id: number;
  taskType: 'discover_airports' | 'refresh_flights' | 'refresh_flights_daily' | 'full_initialize';
  parentId?: number | null;
  status: 'running' | 'success' | 'failed';
  days?: number;
  airportCount: number;
  flightCount: number;
  details?: string;
  errorMessage?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  createdAt: string;
}

export interface QueryLogsParams {
  taskType?: 'discover_airports' | 'refresh_flights' | 'full_initialize';
  status?: 'running' | 'success' | 'failed';
  page?: number;
  pageSize?: number;
}

export interface QueryLogsResponse {
  logs: CrawlerLog[];
  total: number;
  page: number;
  pageSize: number;
}

// 查询执行日志
export const queryCrawlerLogs = (params?: QueryLogsParams): Promise<QueryLogsResponse> => {
  return api.get('/crawler/logs', { params });
};

// 获取日志详情
export const getCrawlerLogDetail = (id: number): Promise<CrawlerLog> => {
  return api.get(`/crawler/logs/${id}`);
};

// 获取日志统计
export interface LogStats {
  total: number;
  successCount: number;
  failedCount: number;
  runningCount: number;
  todayCount: number;
}

export const getCrawlerLogStats = (): Promise<LogStats> => {
  return api.get('/crawler/logs-stats');
};

// 获取子任务日志列表
export const getSubLogs = (parentId: number): Promise<CrawlerLog[]> => {
  return api.get(`/crawler/logs/${parentId}/sub-tasks`);
};

// 强制停止当前运行中的爬虫任务
export const stopCrawler = (): Promise<{
  stopped: boolean;
  taskId: number | null;
  message: string;
}> => {
  return api.post('/crawler/stop');
};

// 清理日志
export const cleanOldLogs = (days?: number): Promise<{ deletedCount: number; message: string }> => {
  return api.delete('/crawler/logs/clean', { data: { days } });
};

export const cleanAllLogs = (): Promise<{ deletedCount: number; message: string }> => {
  return api.delete('/crawler/logs/clean-all');
};

// 定时任务相关
export interface CronJob {
  name: string;
  cron: string;
  desc: string;
  active: boolean;
  running: boolean;
  nextDate: string | null;
}

export const getCronJobs = (): Promise<CronJob[]> => {
  return api.get('/crawler/cron/list');
};

export const triggerCronJob = (name: string): Promise<{ success: boolean; message: string }> => {
  return api.post('/crawler/cron/trigger', { name });
};

export const toggleCronJob = (name: string, enable: boolean): Promise<{ success: boolean; running: boolean; message: string }> => {
  return api.post('/crawler/cron/toggle', { name, enable });
};

// 清除所有查询缓存
export const clearQueryCache = (): Promise<{ deletedCount: number; message: string }> => {
  return api.delete('/crawler/cache/clear');
};

// 查询缓存统计（含缓存开关状态）
export const getQueryCacheStats = (): Promise<{ total: number; expired: number; valid: number; disabled: boolean }> => {
  return api.get('/crawler/cache/stats');
};

// 缓存条目
export interface CacheItem {
  cacheKey: string;
  type: string;
  createdAt: string;
  expireAt: string;
  expired: boolean;
  dataSize: number;
}

// 查询缓存列表
export const listQueryCache = (params?: { page?: number; pageSize?: number; type?: string }): Promise<{ list: CacheItem[]; total: number }> => {
  return api.get('/crawler/cache/list', { params });
};

// 批量删除缓存
export const deleteCacheByKeys = (keys: string[]): Promise<{ deletedCount: number }> => {
  return api.delete('/crawler/cache/batch', { data: { keys } });
};

// 切换缓存开关
export const toggleCache = (enable: boolean): Promise<{ disabled: boolean }> => {
  return api.post('/crawler/cache/toggle', { enable });
};

// 查询往返航班详情
export interface RoundTripFlights {
  outboundFlights: Flight[];
  returnFlights: Flight[];
}

export const queryRoundTripFlights = (
  params: QueryFlightsParams
): Promise<RoundTripFlights> => {
  return api.get('/flights/round-trip', { params });
};

// 分页查询航班（带筛选和排序）
export const queryFlightsWithPagination = (params: {
  page?: number;
  pageSize?: number;
  origin?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  cardType?: string;
  flightNo?: string;
  sortBy?: 'departureTime' | 'arrivalTime' | 'flightNo' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
}): Promise<{
  flights: Flight[];
  total: number;
  page: number;
  pageSize: number;
  cardType666Count: number;
  cardType2666Count: number;
}> => {
  return api.get('/flights/paginated', { params });
};

// 按 ID 获取航班详情
export const getFlightById = (id: number): Promise<Flight> => {
  return api.get(`/flights/${id}`);
};

// 更新航班
export const updateFlight = (id: number, data: Partial<Flight>): Promise<{
  message: string;
  flight: Flight;
}> => {
  return api.put(`/flights/${id}`, data);
};

// 删除航班
export const deleteFlight = (id: number): Promise<{ success: boolean; message: string }> => {
  return api.delete(`/flights/${id}`);
};

// 批量删除航班
export const batchDeleteFlights = (ids: number[]): Promise<{
  success: boolean;
  deletedCount: number;
  message: string;
}> => {
  return api.post('/flights/batch-delete', { ids });
};

// 删除 N 天前的历史航班
export const deleteFlightsBeforeDays = (days: number): Promise<{
  success: boolean;
  deletedCount: number;
  message: string;
}> => {
  return api.delete(`/flights/before-days/${days}`);
};

// 路由规划相关类型
export interface FlightSegment {
  flightNo: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: number; // 分钟
}

export interface RouteResult {
  segments: FlightSegment[];
  totalDuration: number; // 分钟
  transferCount: number;
  layovers: { city: string; duration: number }[];
  score: number;
}

export interface RoutePlanResponse {
  routes: RouteResult[];
  searchParams: {
    origin: string;
    destination?: string;
    departureDate: string;
    endDate?: string;
    maxTransfers: number;
  };
}

// 规划路线（支持中转）
export const planRoute = (params: {
  origin: string;
  destination: string;
  departureDate: string;
  endDate?: string;
  maxTransfers?: number;
  minLayoverHours?: number;
  maxLayoverHours?: number;
}): Promise<RoutePlanResponse> => {
  return api.post('/routes/plan', params);
};

// 发现中转目的地（中转往返 + 中转单程）
export interface TransferRoundTripDest {
  city: string;
  outboundRoutes: RouteResult[];
  returnRoutes: RouteResult[];
  outboundCount: number;
  returnCount: number;
}

export interface TransferOneWayDest {
  city: string;
  routes: RouteResult[];
  routeCount: number;
}

export interface DiscoverTransferResponse {
  roundTrip: TransferRoundTripDest[];
  oneWay: TransferOneWayDest[];
  total: number;
}

// 手动触发中转缓存预热
export const warmupTransferCache = (): Promise<{ message: string }> => {
  return api.post('/routes/warmup-cache');
};

// 查询缓存预热状态
export interface WarmupStatus {
  running: boolean;
  total: number;
  warmed: number;
  skipped: number;
  current: string | null;
  startedAt: string | null;
  finishedAt: string | null;
}

export const getWarmupCacheStatus = (): Promise<WarmupStatus> => {
  return api.get('/routes/warmup-cache/status');
};

export const discoverTransferDestinations = (params: {
  origin: string;
  departureDate: string;
  endDate?: string;
  maxTransfers?: number;
}): Promise<DiscoverTransferResponse> => {
  return api.post('/routes/discover-transfer', params, { timeout: 120000 }); // 中转搜索最多等 2 分钟
};
