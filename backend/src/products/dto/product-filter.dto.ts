import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { ProductCategory } from '@prisma/client';
import { Type } from 'class-transformer';

export class ProductFilterDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  asCode?: string;
}
