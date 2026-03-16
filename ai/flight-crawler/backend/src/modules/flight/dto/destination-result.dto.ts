export class DestinationResultDto {
  destination: string;
  flightCount: number;
  availableDates: string[];
  cardTypes: string[]; // 该目的地支持的权益卡类型列表
  hasReturn: boolean; // 是否有返程航班
  returnFlightCount?: number; // 返程航班数量
  returnAvailableDates?: string[]; // 返程可用日期
}

export class DestinationsResponseDto {
  destinations: DestinationResultDto[];
  totalCount: number;
  dateRange: {
    start: string;
    end: string;
  };
}

export class RoundTripFlightsDto {
  outboundFlights: any[]; // 去程航班列表
  returnFlights: any[]; // 返程航班列表
}
