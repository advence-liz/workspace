import { RouteResultDto } from './route-result.dto';

export class ExploreDestinationDto {
  city: string;
  bestOutbound: RouteResultDto;
  bestReturn: RouteResultDto;
  outboundCount: number;
  returnCount: number;
  score: number;
}

export class ExplorePlanResponseDto {
  destinations: ExploreDestinationDto[];
  searchParams: {
    origin: string;
    departureDate: string;
    returnDate: string;
    maxTransfers: number;
  };
}
