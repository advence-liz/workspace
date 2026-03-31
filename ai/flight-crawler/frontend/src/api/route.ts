import api from './index';

// 单程行程参数
export interface PlanRouteParams {
  origin: string;
  destination?: string;
  departureDate: string;
  endDate?: string; // 单程区间模式的结束日期
  maxTransfers?: number;
  minLayoverHours?: number;
  maxLayoverHours?: number;
  flightType?: '666权益卡航班' | '2666权益卡航班';
}

// 往返行程参数
export interface PlanRoundTripParams {
  origin: string;
  destination?: string;
  departureDate: string;
  departureDateEnd?: string;  // 去程日期范围结束
  returnDate: string;
  returnDateEnd?: string;     // 返程日期范围结束
  maxTransfers?: number;
  minLayoverHours?: number;
  maxLayoverHours?: number;
  autoDiscover?: boolean;
  flightType?: '666权益卡航班' | '2666权益卡航班';
}

export interface FlightSegment {
  flightNo: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: number;
}

export interface RouteResult {
  segments: FlightSegment[];
  totalDuration: number;
  transferCount: number;
  layovers: {
    city: string;
    duration: number;
  }[];
  score: number;
}

// 单程行程响应
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

// 往返行程结果
export interface RoundTripResult {
  outbound: RouteResult;
  return: RouteResult;
  totalDuration: number;
  totalTransferCount: number;
  score: number;
}

// 往返行程响应
export interface RoundTripPlanResponse {
  routes: RoundTripResult[];
  searchParams: {
    origin: string;
    destination?: string;
    departureDate: string;
    returnDate: string;
    maxTransfers: number;
    autoDiscover: boolean;
  };
}

// 探索模式：找所有可往返目的地
export interface ExploreParams {
  origin: string;
  departureDate: string;
  departureDateEnd?: string;
  returnDate: string;
  returnDateEnd?: string;
  maxTransfers?: number;
  flightType?: '666权益卡航班' | '2666权益卡航班';
}

export interface ExploreDestination {
  city: string;
  bestOutbound: RouteResult;
  bestReturn: RouteResult;
  outboundCount: number;
  returnCount: number;
  score: number;
}

export interface ExplorePlanResponse {
  destinations: ExploreDestination[];
  searchParams: {
    origin: string;
    departureDate: string;
    returnDate: string;
    maxTransfers: number;
  };
}

// 规划单程路线
export const planRoute = (params: PlanRouteParams): Promise<RoutePlanResponse> => {
  return api.post('/routes/plan', params);
};

// 规划往返行程（指定目的地）
export const planRoundTrip = (params: PlanRoundTripParams): Promise<RoundTripPlanResponse> => {
  return api.post('/routes/round-trip', params);
};

// 探索模式：发现所有可往返目的地（首次无缓存时耗时较长，timeout 延长至 120s）
export const exploreDestinations = (params: ExploreParams): Promise<ExplorePlanResponse> => {
  return api.post('/routes/explore', params, { timeout: 120000 });
};
