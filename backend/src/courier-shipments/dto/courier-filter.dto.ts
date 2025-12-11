import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CourierStatus } from '@prisma/client';

export class CourierFilterDto {
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsEnum(CourierStatus)
  @IsOptional()
  status?: CourierStatus;

  @IsString()
  @IsOptional()
  campaignId?: string;

  @IsString()
  @IsOptional()
  influencerId?: string;

  @IsString()
  @IsOptional()
  sendStoreId?: string;

  @IsString()
  @IsOptional()
  returnStoreId?: string;

  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @IsString()
  @IsOptional()
  courierName?: string;

  @IsString()
  @IsOptional()
  dateFrom?: string;

  @IsString()
  @IsOptional()
  dateTo?: string;
}
