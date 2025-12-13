import {
  IsEnum,
  IsDecimal,
  IsString,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { MetricType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreatePerformanceMetricDto {
  @IsEnum(MetricType)
  metricType: MetricType;

  @Type(() => Number)
  @IsDecimal()
  value: number;

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
  instagramProfileUrl?: string;

  @IsOptional()
  @IsNumber()
  instagramFollowers?: number;

  @IsOptional()
  @Type(() => Number)
  @IsDecimal()
  instagramEngagementRate?: number;

  @IsOptional()
  instagramLinkData?: Record<string, unknown>;

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  recordedAt?: string;
}
