import {
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  IsArray,
  IsUrl,
} from 'class-validator';
import { ProductCategory } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  sku: string;

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

  @IsNumber()
  price: number;

  @IsOptional()
  @IsArray()
  imageUrls?: string[];

  @IsOptional()
  metadata?: Record<string, any>;
}
