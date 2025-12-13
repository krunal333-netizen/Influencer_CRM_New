import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { MetricType } from '@prisma/client';
import { Type } from 'class-transformer';

export class PerformanceMetricFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsEnum(MetricType)
  metricType?: MetricType;

  @IsOptional()
  @IsString()
  influencerId?: string;

  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @IsString()
  storeId?: string;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;
}
