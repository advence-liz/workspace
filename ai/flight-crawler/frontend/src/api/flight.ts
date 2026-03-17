import api from './index';

export interface QueryFlightsParams {
  origin: string;
  destination?: string;
  startDate: string;
  endDate: string;
  flightType?: '全部' | '666权益卡' | '2666权益卡';
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
  cardType: string;
}

// 查询所有可达目的地
export const queryDestinations = (
  params: QueryFlightsParams
): Promise<DestinationsResponse> => {
  return api.get('/flights/destinations', { params });
};

// 查询航班列表
export const queryFlights = (params: QueryFlightsParams): Promise<Flight[]> => {
  return api.get('/flights', { params });
};

// 触发爬虫
export const triggerCrawler = (): Promise<{ success: boolean; count: number }> => {
  return api.post('/crawler/trigger');
};

// 获取所有可用的城市列表
export const getAvailableCities = (): Promise<{ origins: string[]; destinations: string[] }> => {
  return api.get('/flights/cities');
};

// 初始化阶段1：发现机场
export const initializeDiscoverAirports = (days?: number): Promise<{
  success: boolean;
  airportCount: number;
  flightCount: number;
  message: string;
}> => {
  return api.post('/crawler/initialize/discover', { days });
};

// 初始化阶段2：发现航班数据（统一新方法）
// 支持三种模式：
// 1. 按天数：initializeDiscoverFlights({ days: 30 })
// 2. 按日期区间：initializeDiscoverFlights({ startDate: "2026-03-20", endDate: "2026-03-25" })
// 3. 仅获取计划：initializeDiscoverFlights({ days: 30, planOnly: true })
export const initializeDiscoverFlights = (options?: {
  days?: number;
  startDate?: string;
  endDate?: string;
  planOnly?: boolean;
}): Promise<{
  success: boolean;
  executionPlan: {
    totalDays: number;
    totalTasks: number;
    dateRange: string[];
    estimatedTime: string;
    taskList: Array<{ taskId: number; date: string; airports: number }>;
  };
  executionResult?: {
    success: boolean;
    totalCount: number;
    successTasks: number;
    failedTasks: number;
    taskDetails: Array<{ taskId: number; date: string; success: boolean; count: number }>;
  };
}> => {
  // 兼容旧的调用方式：initializeDiscoverFlights(7) -> initializeDiscoverFlights({ days: 7 })
  const params = typeof options === 'number' ? { days: options } : (options || {});
  return api.post('/crawler/initialize/refresh', params);
};

// 初始化阶段2：按周拆分发现航班数据（优化版）
export const initializeDiscoverFlightsByWeeks = (totalDays?: number, daysPerTask?: number): Promise<{
  success: boolean;
  totalCount: number;
  tasks: any[];
  message: string;
}> => {
  return api.post('/crawler/initialize/refresh-by-weeks', { totalDays, daysPerTask });
};

// 初始化阶段2：按日期区间发现航班数据
export const initializeDiscoverFlightsByDateRange = (
  startDate: string,
  endDate: string,
  daysPerTask?: number
): Promise<{
  success: boolean;
  totalCount: number;
  tasks: any[];
  message: string;
}> => {
  return api.post('/crawler/initialize/refresh-by-date-range', { startDate, endDate, daysPerTask });
};

// 一键初始化（发现机场 + 发现航班）
export const initializeAll = (discoverDays?: number, refreshDays?: number): Promise<{
  success: boolean;
  count: number;
  message: string;
}> => {
  return api.post('/crawler/trigger', { discoverDays, refreshDays });
};

// 执行日志相关接口
export interface CrawlerLog {
  id: number;
  taskType: 'discover_airports' | 'refresh_flights' | 'full_initialize';
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

// 清理日志
export const cleanOldLogs = (days?: number): Promise<{ deletedCount: number; message: string }> => {
  return api.delete('/crawler/logs/clean', { data: { days } });
};

export const cleanAllLogs = (): Promise<{ deletedCount: number; message: string }> => {
  return api.delete('/crawler/logs/clean-all');
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
