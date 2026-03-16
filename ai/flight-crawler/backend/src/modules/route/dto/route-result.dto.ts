export class FlightSegmentDto {
  flightNo: string;
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  duration: number; // 分钟
}

export class RouteResultDto {
  segments: FlightSegmentDto[];
  totalDuration: number; // 分钟
  transferCount: number;
  layovers: {
    city: string;
    duration: number; // 分钟
  }[];
  score: number; // 综合评分
}

export class RoutePlanResponseDto {
  routes: RouteResultDto[];
  searchParams: {
    origin: string;
    destination?: string;
    departureDate: string;
    endDate?: string;
    returnDate?: string;
    maxTransfers: number;
  };
}
