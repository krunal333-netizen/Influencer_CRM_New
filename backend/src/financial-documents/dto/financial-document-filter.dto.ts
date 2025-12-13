import { IsOptional, IsString, IsEnum, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { FinancialDocumentType } from './create-financial-document.dto';

export class FinancialDocumentFilterDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsEnum(FinancialDocumentType)
  type?: FinancialDocumentType;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @IsDateString()
  issueDateFrom?: string;

  @IsOptional()
  @IsDateString()
  issueDateTo?: string;

  @IsOptional()
  @IsDateString()
  dueDateFrom?: string;

  @IsOptional()
  @IsDateString()
  dueDateTo?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
