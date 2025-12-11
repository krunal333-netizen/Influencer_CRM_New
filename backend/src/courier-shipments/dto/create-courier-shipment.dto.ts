import { IsString, IsOptional, IsEnum } from 'class-validator';
import { CourierStatus } from '@prisma/client';

export class CreateCourierShipmentDto {
  @IsString()
  trackingNumber: string;

  @IsString()
  courierName: string;

  @IsString()
  courierCompany: string;

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
  status?: CourierStatus = CourierStatus.PENDING;
}
