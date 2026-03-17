import api from './index';

export interface Airport {
  id: number;
  name: string;
  city: string;
  enableCrawl: boolean;
  discoveredAt: string;
  updatedAt: string;
}

export interface AirportStats {
  airportId: number;
  airportName: string;
  city: string;
  enableCrawl: boolean;
  totalFlights: number;
  asOriginCount: number;
  asDestinationCount: number;
}

// 分页查询机场（带筛选和排序）
export const queryAirportsWithPagination = (params: {
  page?: number;
  pageSize?: number;
  city?: string;
  name?: string;
  enableCrawl?: boolean;
  sortBy?: 'name' | 'city' | 'discoveredAt' | 'updatedAt';
  sortOrder?: 'ASC' | 'DESC';
}): Promise<{
  airports: Airport[];
  total: number;
  page: number;
  pageSize: number;
}> => {
  return api.get('/airports/paginated', { params });
};

// 按 ID 获取机场详情
export const getAirportById = (id: number): Promise<Airport> => {
  return api.get(`/airports/${id}`);
};

// 获取机场统计信息
export const getAirportStats = (id: number): Promise<AirportStats> => {
  return api.get(`/airports/${id}/stats`);
};

// 更新机场
export const updateAirport = (id: number, data: Partial<Airport>): Promise<{
  message: string;
  airport: Airport;
}> => {
  return api.put(`/airports/${id}`, data);
};

// 删除机场
export const deleteAirport = (id: number): Promise<{ success: boolean; message: string }> => {
  return api.delete(`/airports/${id}`);
};

// 批量删除机场
export const batchDeleteAirports = (ids: number[]): Promise<{
  success: boolean;
  deletedCount: number;
  message: string;
}> => {
  return api.post('/airports/batch-delete', { ids });
};
