import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { CourierStatus } from '@prisma/client';

export class ShipmentTimelineEventDto {
  @IsEnum(CourierStatus)
  status: CourierStatus;

  @IsDateString()
  timestamp: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  userId?: string;
}
