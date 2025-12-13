import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { PaymentStatus, PayoutType } from '@prisma/client';
import { Type } from 'class-transformer';

export class PayoutFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsEnum(PayoutType)
  type?: PayoutType;

  @IsOptional()
  @IsString()
  influencerId?: string;

  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;
}
