import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsNumber,
} from 'class-validator';
import { InvoiceImageStatus } from '@prisma/client';

export class UpdateInvoiceDto {
  @IsString()
  @IsOptional()
  campaignId?: string;

  @IsString()
  @IsOptional()
  productId?: string;

  @IsEnum(InvoiceImageStatus)
  @IsOptional()
  status?: InvoiceImageStatus;

  @IsObject()
  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ocrData?: Record<string, any>;

  @IsNumber()
  @IsOptional()
  extractedTotal?: number;
}
