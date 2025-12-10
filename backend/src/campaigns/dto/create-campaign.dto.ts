import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsInt,
  Min,
} from 'class-validator';
import { CampaignType } from '@prisma/client';

export class CreateCampaignDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsEnum(CampaignType)
  type?: CampaignType;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsNumber()
  budgetSpent?: number;

  @IsOptional()
  @IsNumber()
  budgetAllocated?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsDateString()
  deliverableDeadline?: string;

  @IsOptional()
  @IsString()
  brief?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  reelsRequired?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  postsRequired?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  storiesRequired?: number;

  @IsString()
  storeId: string;
}
