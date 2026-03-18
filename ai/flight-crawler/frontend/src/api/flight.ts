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
  aircraftType?: string;
  cardType: string;
  crawledAt?: string;
}

// 查询所有可达目的地
export const queryDestinations = (
  params: QueryFlightsParams
): Promise<DestinationsResponse> => {
  return api.get('/flights/destinations', { params });
};


// 获取所有可用的城市列表
export const getAvailableCities = (): Promise<{ origins: string[]; destinations: string[] }> => {
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
