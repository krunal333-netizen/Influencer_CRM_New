import { IsString, IsOptional, IsEnum } from 'class-validator';
import { InvoiceImageStatus } from '@prisma/client';

export class CreateInvoiceDto {
  @IsString()
  @IsOptional()
  campaignId?: string;

  @IsString()
  @IsOptional()
  productId?: string;

  @IsEnum(InvoiceImageStatus)
  @IsOptional()
  status?: InvoiceImageStatus = InvoiceImageStatus.PENDING;
}
