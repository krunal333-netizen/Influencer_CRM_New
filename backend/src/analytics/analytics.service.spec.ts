import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { MetricType } from '@prisma/client';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: PrismaService;

  const mockInfluencer = {
    id: 'inf-1',
    name: 'Test Influencer',
    email: 'test@example.com',
    followers: 10000,
  };

  const mockCampaign = {
    id: 'camp-1',
    name: 'Test Campaign',
    budget: 5000,
    budgetSpent: 2000,
    budgetAllocated: 3000,
  };

  const mockStore = {
    id: 'store-1',
    name: 'Test Store',
  };

  const mockMetric = {
    id: 'metric-1',
    metricType: MetricType.REACH,
    value: 1000,
    influencerId: 'inf-1',
    campaignId: 'camp-1',
    recordedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: {
            performanceMetric: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              count: jest.fn(),
              delete: jest.fn(),
            },
            influencer: {
              findUnique: jest.fn(),
            },
            campaign: {
              findUnique: jest.fn(),
            },
            store: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('recordPerformanceMetric', () => {
    it('should record a performance metric', async () => {
      const dto = {
        metricType: MetricType.REACH,
        value: 1000,
        influencerId: 'inf-1',
      };

      jest
        .spyOn(prisma.influencer, 'findUnique')
        .mockResolvedValue(mockInfluencer as any);
      jest
        .spyOn(prisma.performanceMetric, 'create')
        .mockResolvedValue(mockMetric as any);

      const result = await service.recordPerformanceMetric(dto);

      expect(result).toEqual(mockMetric);
      expect(prisma.performanceMetric.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if influencer not found', async () => {
      const dto = {
        metricType: MetricType.REACH,
        value: 1000,
        influencerId: 'invalid-id',
      };

      jest.spyOn(prisma.influencer, 'findUnique').mockResolvedValue(null);

      await expect(service.recordPerformanceMetric(dto)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw NotFoundException if campaign not found', async () => {
      const dto = {
        metricType: MetricType.REACH,
        value: 1000,
        campaignId: 'invalid-id',
      };

      jest.spyOn(prisma.campaign, 'findUnique').mockResolvedValue(null);

      await expect(service.recordPerformanceMetric(dto)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated metrics', async () => {
      const mockMetrics = [mockMetric];
      jest
        .spyOn(prisma.performanceMetric, 'findMany')
        .mockResolvedValue(mockMetrics as any);
      jest.spyOn(prisma.performanceMetric, 'count').mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(mockMetrics);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter metrics by metricType', async () => {
      jest
        .spyOn(prisma.performanceMetric, 'findMany')
        .mockResolvedValue([mockMetric] as any);
      jest.spyOn(prisma.performanceMetric, 'count').mockResolvedValue(1);

      await service.findAll({ metricType: MetricType.REACH });

      expect(prisma.performanceMetric.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ metricType: MetricType.REACH }),
        })
      );
    });
  });

  describe('computeInfluencerPerformanceScore', () => {
    it('should compute performance score', async () => {
      const metrics = [
        { metricType: MetricType.REACH, value: 100 },
        { metricType: MetricType.ENGAGEMENT, value: 50 },
      ];

      jest.spyOn(prisma.influencer, 'findUnique').mockResolvedValue({
        ...mockInfluencer,
        performanceMetrics: metrics,
      } as any);

      const score = await service.computeInfluencerPerformanceScore('inf-1');

      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return 0 if no metrics', async () => {
      jest.spyOn(prisma.influencer, 'findUnique').mockResolvedValue({
        ...mockInfluencer,
        performanceMetrics: [],
      } as any);

      const score = await service.computeInfluencerPerformanceScore('inf-1');

      expect(score).toBe(0);
    });

    it('should throw NotFoundException if influencer not found', async () => {
      jest.spyOn(prisma.influencer, 'findUnique').mockResolvedValue(null);

      await expect(
        service.computeInfluencerPerformanceScore('invalid-id')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('computeBudgetUtilization', () => {
    it('should compute budget utilization', async () => {
      jest.spyOn(prisma.campaign, 'findUnique').mockResolvedValue({
        ...mockCampaign,
        influencerLinks: [],
      } as any);

      const result = await service.computeBudgetUtilization('camp-1');

      expect(result.campaignId).toBe('camp-1');
      expect(result.budget).toBe(5000);
      expect(result.spent).toBe(2000);
      expect(result.utilizationRate).toBe(40);
    });

    it('should handle zero budget', async () => {
      jest.spyOn(prisma.campaign, 'findUnique').mockResolvedValue({
        ...mockCampaign,
        budget: 0,
        budgetSpent: 0,
        budgetAllocated: 0,
        influencerLinks: [],
      } as any);

      const result = await service.computeBudgetUtilization('camp-1');

      expect(result.utilizationRate).toBe(0);
    });

    it('should throw NotFoundException if campaign not found', async () => {
      jest.spyOn(prisma.campaign, 'findUnique').mockResolvedValue(null);

      await expect(
        service.computeBudgetUtilization('invalid-id')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAggregatedAnalytics', () => {
    it('should throw error if dateFrom is after dateTo', async () => {
      const dto = {
        storeId: 'store-1',
        dateFrom: '2024-12-31',
        dateTo: '2024-01-01',
      };

      await expect(service.getAggregatedAnalytics(dto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw error if no location identifier provided', async () => {
      const dto = {
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
      };

      await expect(service.getAggregatedAnalytics(dto)).rejects.toThrow(
        BadRequestException
      );
    });
  });
});
