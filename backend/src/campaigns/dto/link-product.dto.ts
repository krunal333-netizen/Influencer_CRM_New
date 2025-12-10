import {
  IsString,
  IsNumber,
  IsOptional,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';

export class LinkProductDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  plannedQty?: number;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
