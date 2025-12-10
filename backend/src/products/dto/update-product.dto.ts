import {
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  IsArray,
} from 'class-validator';
import { ProductCategory } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  asCode?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  stock?: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsArray()
  imageUrls?: string[];

  @IsOptional()
  metadata?: Record<string, any>;
}
