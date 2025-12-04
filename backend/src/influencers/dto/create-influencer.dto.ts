import { IsEmail, IsEnum, IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';

enum InfluencerStatus {
  COLD = 'COLD',
  ACTIVE = 'ACTIVE',
  FINAL = 'FINAL'
}

export class CreateInfluencerDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  followers?: number;

  @IsOptional()
  @IsEnum(InfluencerStatus)
  status?: InfluencerStatus;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsUrl()
  profileUrl?: string;
}
