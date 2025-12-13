import {
  IsEnum,
  IsDecimal,
  IsString,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { PayoutType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreatePayoutDto {
  @IsEnum(PayoutType)
  type: PayoutType;

  @Type(() => Number)
  @IsDecimal()
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  influencerId?: string;

  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @IsString()
  invoiceId?: string;

  @IsOptional()
  @IsString()
  poId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}
