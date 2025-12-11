import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { CourierStatus } from '@prisma/client';

export class UpdateCourierShipmentDto {
  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @IsString()
  @IsOptional()
  courierName?: string;

  @IsString()
  @IsOptional()
  courierCompany?: string;

  @IsString()
  @IsOptional()
  sendStoreId?: string;

  @IsString()
  @IsOptional()
  returnStoreId?: string;

  @IsString()
  @IsOptional()
  influencerId?: string;

  @IsString()
  @IsOptional()
  campaignId?: string;

  @IsEnum(CourierStatus)
  @IsOptional()
  status?: CourierStatus;

  @IsDateString()
  @IsOptional()
  sentDate?: string;

  @IsDateString()
  @IsOptional()
  receivedDate?: string;

  @IsDateString()
  @IsOptional()
  returnedDate?: string;
}
