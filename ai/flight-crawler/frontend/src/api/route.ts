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
}

// 往返行程参数
export interface PlanRoundTripParams {
  origin: string;
  destination?: string; // 不填则自动发现所有往返方案
  departureDate: string;
  returnDate: string; // 必填
  maxTransfers?: number;
  minLayoverHours?: number;
  maxLayoverHours?: number;
  autoDiscover?: boolean;
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
  outbound: {
    segments: FlightSegment[];
    totalDuration: number;
    transferCount: number;
    layovers: {
      city: string;
      duration: number;
    }[];
  };
  return: {
    segments: FlightSegment[];
    totalDuration: number;
    transferCount: number;
    layovers: {
      city: string;
      duration: number;
    }[];
  };
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

// 规划单程路线
export const planRoute = (params: PlanRouteParams): Promise<RoutePlanResponse> => {
  return api.post('/routes/plan', params);
};

// 规划往返行程
export const planRoundTrip = (params: PlanRoundTripParams): Promise<RoundTripPlanResponse> => {
  return api.post('/routes/round-trip', params);
};
