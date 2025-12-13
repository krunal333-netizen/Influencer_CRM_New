import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsDateString, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export enum FinancialDocumentType {
  PO = 'PO',
  INVOICE = 'INVOICE',
  FORM = 'FORM',
}

export class CreateFinancialDocumentDto {
  @IsEnum(FinancialDocumentType)
  @IsNotEmpty()
  type!: FinancialDocumentType;

  @IsString()
  @IsNotEmpty()
  documentNumber!: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  amount!: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsDateString()
  @IsNotEmpty()
  issueDate!: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsDateString()
  @IsOptional()
  paidDate?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;

  @IsString()
  @IsOptional()
  filePath?: string;

  @IsString()
  @IsNotEmpty()
  campaignId!: string;
}
