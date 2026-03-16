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

// 初始化阶段2：发现航班数据
export const initializeDiscoverFlights = (days?: number): Promise<{
  success: boolean;
  count: number;
  message: string;
}> => {
  return api.post('/crawler/initialize/refresh', { days });
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
