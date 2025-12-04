import { Module } from '@nestjs/common';
import { ApifyController } from './apify.controller';
import { ApifyService } from './apify.service';

@Module({
  controllers: [ApifyController],
  providers: [ApifyService],
  exports: [ApifyService],
})
export class ApifyModule {}