import { FlightSegmentDto } from './route-result.dto';

/**
 * 往返行程结果 DTO
 */
export class RoundTripResultDto {
  // 去程信息
  outbound: {
    segments: FlightSegmentDto[];
    totalDuration: number;
    transferCount: number;
    layovers: {
      city: string;
      duration: number;
    }[];
  };

  // 返程信息
  return: {
    segments: FlightSegmentDto[];
    totalDuration: number;
    transferCount: number;
    layovers: {
      city: string;
      duration: number;
    }[];
  };

  // 往返总计
  totalDuration: number;
  totalTransferCount: number;
  score: number; // 综合评分
}

/**
 * 往返行程规划响应 DTO
 */
export class RoundTripPlanResponseDto {
  routes: RoundTripResultDto[];
  searchParams: {
    origin: string;
    destination?: string;
    departureDate: string;
    returnDate: string;
    maxTransfers: number;
    autoDiscover: boolean;
  };
}
