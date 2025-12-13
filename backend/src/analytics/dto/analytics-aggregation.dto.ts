import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum AggregationPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export class AnalyticsAggregationDto {
  @IsOptional()
  @IsString()
  storeId?: string;

  @IsOptional()
  @IsString()
  firmId?: string;

  @IsOptional()
  @IsString()
  influencerId?: string;

  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsString()
  dateFrom: string;

  @IsString()
  dateTo: string;

  @IsOptional()
  @IsEnum(AggregationPeriod)
  period?: AggregationPeriod;
}
