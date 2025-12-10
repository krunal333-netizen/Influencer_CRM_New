import { Module } from '@nestjs/common';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { CampaignProductsService } from './campaign-products.service';
import { CampaignInfluencersService } from './campaign-influencers.service';

@Module({
  controllers: [CampaignsController],
  providers: [
    CampaignsService,
    CampaignProductsService,
    CampaignInfluencersService,
  ],
  exports: [
    CampaignsService,
    CampaignProductsService,
    CampaignInfluencersService,
  ],
})
export class CampaignsModule {}
