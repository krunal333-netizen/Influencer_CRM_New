import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';

export class AssignInfluencerDto {
  @IsString()
  influencerId: string;

  @IsNumber()
  rate: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  deliverables?: string;

  @IsOptional()
  @IsString()
  deliverableType?: string;

  @IsOptional()
  @IsDateString()
  expectedDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
