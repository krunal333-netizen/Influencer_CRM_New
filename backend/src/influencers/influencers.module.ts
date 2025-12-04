import { Module } from '@nestjs/common';
import { InfluencersController } from './influencers.controller';
import { InfluencersService } from './influencers.service';
import { ApifyModule } from '../apify/apify.module';

@Module({
  imports: [ApifyModule],
  controllers: [InfluencersController],
  providers: [InfluencersService],
  exports: [InfluencersService],
})
export class InfluencersModule {}
