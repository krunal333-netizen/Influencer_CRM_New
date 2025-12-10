import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CampaignInfluencersService } from './campaign-influencers.service';
import { PrismaService } from '../prisma/prisma.service';
import { AssignInfluencerDto } from './dto/assign-influencer.dto';

describe('CampaignInfluencersService', () => {
  let service: CampaignInfluencersService;
  let prismaService: any;

  const mockInfluencerCampaignLink = {
    id: 'link-1',
    campaignId: 'campaign-1',
    influencerId: 'influencer-1',
    rate: 500,
    status: 'PENDING',
    deliverables: 'One reels video',
    deliverableType: 'reel',
    expectedDate: new Date('2024-02-15'),
    notes: 'Test notes',
    createdAt: new Date(),
    updatedAt: new Date(),
    campaign: {
      id: 'campaign-1',
      name: 'Test Campaign',
    },
    influencer: {
      id: 'influencer-1',
      name: 'Test Influencer',
      email: 'influencer@example.com',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignInfluencersService,
        {
          provide: PrismaService,
          useValue: {
            campaign: {
              findUnique: jest.fn(),
            },
            influencer: {
              findUnique: jest.fn(),
            },
            influencerCampaignLink: {
              upsert: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CampaignInfluencersService>(
      CampaignInfluencersService
    );
    prismaService = module.get(PrismaService);
  });

  describe('assignInfluencer', () => {
    it('should assign an influencer to a campaign', async () => {
      const assignDto: AssignInfluencerDto = {
        influencerId: 'influencer-1',
        rate: 500,
        status: 'PENDING',
        deliverables: 'One reels video',
        deliverableType: 'reel',
        expectedDate: '2024-02-15',
        notes: 'Test notes',
      };

      prismaService.campaign.findUnique.mockResolvedValue({ id: 'campaign-1' });
      prismaService.influencer.findUnique.mockResolvedValue({
        id: 'influencer-1',
      });
      prismaService.influencerCampaignLink.upsert.mockResolvedValue(
        mockInfluencerCampaignLink
      );

      const result = await service.assignInfluencer('campaign-1', assignDto);

      expect(prismaService.campaign.findUnique).toHaveBeenCalledWith({
        where: { id: 'campaign-1' },
      });
      expect(prismaService.influencer.findUnique).toHaveBeenCalledWith({
        where: { id: 'influencer-1' },
      });
      expect(result).toEqual(mockInfluencerCampaignLink);
    });

    it('should throw BadRequestException when campaign not found', async () => {
      prismaService.campaign.findUnique.mockResolvedValue(null);

      const assignDto: AssignInfluencerDto = {
        influencerId: 'influencer-1',
        rate: 500,
      };

      await expect(
        service.assignInfluencer('non-existent', assignDto)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when influencer not found', async () => {
      prismaService.campaign.findUnique.mockResolvedValue({ id: 'campaign-1' });
      prismaService.influencer.findUnique.mockResolvedValue(null);

      const assignDto: AssignInfluencerDto = {
        influencerId: 'non-existent',
        rate: 500,
      };

      await expect(
        service.assignInfluencer('campaign-1', assignDto)
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle date conversion for expectedDate', async () => {
      const assignDto: AssignInfluencerDto = {
        influencerId: 'influencer-1',
        rate: 500,
        expectedDate: '2024-02-15',
      };

      prismaService.campaign.findUnique.mockResolvedValue({ id: 'campaign-1' });
      prismaService.influencer.findUnique.mockResolvedValue({
        id: 'influencer-1',
      });
      prismaService.influencerCampaignLink.upsert.mockResolvedValue(
        mockInfluencerCampaignLink
      );

      await service.assignInfluencer('campaign-1', assignDto);

      expect(prismaService.influencerCampaignLink.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            expectedDate: new Date('2024-02-15'),
          }),
          update: expect.objectContaining({
            expectedDate: new Date('2024-02-15'),
          }),
        })
      );
    });
  });

  describe('unassignInfluencer', () => {
    it('should unassign an influencer from a campaign', async () => {
      prismaService.influencerCampaignLink.findUnique.mockResolvedValue(
        mockInfluencerCampaignLink
      );
      prismaService.influencerCampaignLink.delete.mockResolvedValue(
        mockInfluencerCampaignLink
      );

      const result = await service.unassignInfluencer(
        'campaign-1',
        'influencer-1'
      );

      expect(prismaService.influencerCampaignLink.delete).toHaveBeenCalledWith({
        where: {
          influencerId_campaignId: {
            influencerId: 'influencer-1',
            campaignId: 'campaign-1',
          },
        },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockInfluencerCampaignLink);
    });

    it('should throw BadRequestException when link not found', async () => {
      prismaService.influencerCampaignLink.findUnique.mockResolvedValue(null);

      await expect(
        service.unassignInfluencer('campaign-1', 'influencer-1')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getCampaignInfluencers', () => {
    it('should get all influencers assigned to a campaign', async () => {
      const mockInfluencers = [mockInfluencerCampaignLink];

      prismaService.influencerCampaignLink.findMany.mockResolvedValue(
        mockInfluencers
      );

      const result = await service.getCampaignInfluencers('campaign-1');

      expect(
        prismaService.influencerCampaignLink.findMany
      ).toHaveBeenCalledWith({
        where: { campaignId: 'campaign-1' },
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
      expect(result).toEqual(mockInfluencers);
    });

    it('should return empty array when campaign has no assigned influencers', async () => {
      prismaService.influencerCampaignLink.findMany.mockResolvedValue([]);

      const result = await service.getCampaignInfluencers('campaign-1');

      expect(result).toEqual([]);
    });
  });
});
