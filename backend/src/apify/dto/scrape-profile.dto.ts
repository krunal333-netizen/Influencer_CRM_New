import { IsString, IsOptional, IsUrl, IsBoolean } from 'class-validator';

export class ScrapeProfileDto {
  @IsString()
  @IsUrl()
  instagramUrl: string;

  @IsOptional()
  @IsBoolean()
  dryRun?: boolean = false;
}