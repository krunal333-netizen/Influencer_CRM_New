import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssignInfluencerDto } from './dto/assign-influencer.dto';

@Injectable()
export class CampaignInfluencersService {
  constructor(private readonly prisma: PrismaService) {}

  async assignInfluencer(
    campaignId: string,
    assignInfluencerDto: AssignInfluencerDto
  ) {
    const { influencerId, expectedDate, ...rest } = assignInfluencerDto;

    // Verify campaign exists
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new BadRequestException(`Campaign with ID ${campaignId} not found`);
    }

    // Verify influencer exists
    const influencer = await this.prisma.influencer.findUnique({
      where: { id: influencerId },
    });

    if (!influencer) {
      throw new BadRequestException(
        `Influencer with ID ${influencerId} not found`
      );
    }

    // Upsert the influencer-campaign link
    return this.prisma.influencerCampaignLink.upsert({
      where: {
        influencerId_campaignId: {
          influencerId,
          campaignId,
        },
      },
      create: {
        influencerId,
        campaignId,
        ...rest,
        expectedDate: expectedDate ? new Date(expectedDate) : null,
      },
      update: {
        ...rest,
        expectedDate: expectedDate ? new Date(expectedDate) : null,
      },
      include: {
        influencer: true,
        campaign: true,
      },
    });
  }

  async unassignInfluencer(campaignId: string, influencerId: string) {
    const link = await this.prisma.influencerCampaignLink.findUnique({
      where: {
        influencerId_campaignId: {
          influencerId,
          campaignId,
        },
      },
    });

    if (!link) {
      throw new BadRequestException(
        `Influencer ${influencerId} is not assigned to campaign ${campaignId}`
      );
    }

    return this.prisma.influencerCampaignLink.delete({
      where: {
        influencerId_campaignId: {
          influencerId,
          campaignId,
        },
      },
      include: {
        influencer: true,
        campaign: true,
      },
    });
  }

  async getCampaignInfluencers(campaignId: string) {
    return this.prisma.influencerCampaignLink.findMany({
      where: { campaignId },
      include: {
        influencer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
