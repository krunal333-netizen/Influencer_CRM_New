import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePerformanceMetricDto } from './dto/create-performance-metric.dto';
import { PerformanceMetricFilterDto } from './dto/performance-metric-filter.dto';
import {
  AnalyticsAggregationDto,
  AggregationPeriod,
} from './dto/analytics-aggregation.dto';
import { MetricType } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async recordPerformanceMetric(dto: CreatePerformanceMetricDto) {
    // Validate references exist
    if (dto.influencerId) {
      const influencer = await this.prisma.influencer.findUnique({
        where: { id: dto.influencerId },
      });
      if (!influencer) {
        throw new NotFoundException(
          `Influencer with ID ${dto.influencerId} not found`
        );
      }
    }

    if (dto.campaignId) {
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: dto.campaignId },
      });
      if (!campaign) {
        throw new NotFoundException(
          `Campaign with ID ${dto.campaignId} not found`
        );
      }
    }

    if (dto.storeId) {
      const store = await this.prisma.store.findUnique({
        where: { id: dto.storeId },
      });
      if (!store) {
        throw new NotFoundException(`Store with ID ${dto.storeId} not found`);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createData: any = {
      metricType: dto.metricType,
      value: dto.value,
      influencerId: dto.influencerId,
      campaignId: dto.campaignId,
      storeId: dto.storeId,
      instagramProfileUrl: dto.instagramProfileUrl,
      instagramFollowers: dto.instagramFollowers,
      instagramEngagementRate: dto.instagramEngagementRate,
      recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : new Date(),
    };

    if (dto.instagramLinkData) {
      createData.instagramLinkData = dto.instagramLinkData;
    }

    if (dto.metadata) {
      createData.metadata = dto.metadata;
    }

    return this.prisma.performanceMetric.create({
      data: createData,
      include: {
        influencer: true,
        campaign: true,
        store: true,
      },
    });
  }

  async findAll(filterDto: PerformanceMetricFilterDto = {}) {
    const {
      page = 1,
      limit = 10,
      metricType,
      influencerId,
      campaignId,
      storeId,
      dateFrom,
      dateTo,
    } = filterDto;

    const where = {
      ...(metricType && { metricType }),
      ...(influencerId && { influencerId }),
      ...(campaignId && { campaignId }),
      ...(storeId && { storeId }),
      ...(dateFrom &&
        dateTo && {
          recordedAt: {
            gte: new Date(dateFrom),
            lte: new Date(dateTo),
          },
        }),
    };

    const skip = (page - 1) * limit;

    const [metrics, total] = await Promise.all([
      this.prisma.performanceMetric.findMany({
        where,
        include: {
          influencer: true,
          campaign: true,
          store: true,
        },
        orderBy: {
          recordedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.performanceMetric.count({ where }),
    ]);

    return {
      data: metrics,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const metric = await this.prisma.performanceMetric.findUnique({
      where: { id },
      include: {
        influencer: true,
        campaign: true,
        store: true,
      },
    });

    if (!metric) {
      throw new NotFoundException(`Performance metric with ID ${id} not found`);
    }

    return metric;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.performanceMetric.delete({
      where: { id },
    });
  }

  async aggregateMetricsByStore(storeId: string, dateFrom: Date, dateTo: Date) {
    const metrics = await this.prisma.performanceMetric.findMany({
      where: {
        storeId,
        recordedAt: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
    });

    return this.aggregateMetrics(metrics);
  }

  async aggregateMetricsByFirm(firmId: string, dateFrom: Date, dateTo: Date) {
    const stores = await this.prisma.store.findMany({
      where: { firmId },
      select: { id: true },
    });

    const storeIds = stores.map((s) => s.id);

    const metrics = await this.prisma.performanceMetric.findMany({
      where: {
        storeId: { in: storeIds },
        recordedAt: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
    });

    return this.aggregateMetrics(metrics);
  }

  async aggregateMetricsByInfluencer(
    influencerId: string,
    dateFrom: Date,
    dateTo: Date
  ) {
    const metrics = await this.prisma.performanceMetric.findMany({
      where: {
        influencerId,
        recordedAt: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
    });

    return this.aggregateMetrics(metrics);
  }

  async aggregateMetricsByCampaign(
    campaignId: string,
    dateFrom: Date,
    dateTo: Date
  ) {
    const metrics = await this.prisma.performanceMetric.findMany({
      where: {
        campaignId,
        recordedAt: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
    });

    return this.aggregateMetrics(metrics);
  }

  async getAggregatedAnalytics(dto: AnalyticsAggregationDto) {
    const dateFrom = new Date(dto.dateFrom);
    const dateTo = new Date(dto.dateTo);

    if (dateFrom > dateTo) {
      throw new BadRequestException('dateFrom must be before dateTo');
    }

    let result;

    if (dto.firmId) {
      result = await this.aggregateMetricsByFirm(dto.firmId, dateFrom, dateTo);
    } else if (dto.storeId) {
      result = await this.aggregateMetricsByStore(
        dto.storeId,
        dateFrom,
        dateTo
      );
    } else if (dto.influencerId) {
      result = await this.aggregateMetricsByInfluencer(
        dto.influencerId,
        dateFrom,
        dateTo
      );
    } else if (dto.campaignId) {
      result = await this.aggregateMetricsByCampaign(
        dto.campaignId,
        dateFrom,
        dateTo
      );
    } else {
      throw new BadRequestException(
        'At least one of firmId, storeId, influencerId, or campaignId is required'
      );
    }

    return {
      ...result,
      period: {
        from: dateFrom,
        to: dateTo,
      },
    };
  }

  private aggregateMetrics(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metrics: any[]
  ) {
    const aggregates = {
      totalReach: 0,
      totalEngagement: 0,
      totalROI: 0,
      totalFollowers: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalConversions: 0,
      instagramLinkClicks: 0,
      metricCount: metrics.length,
      byType: {} as Record<string, number>,
    };

    metrics.forEach((metric) => {
      const value = Number(metric.value);

      switch (metric.metricType) {
        case MetricType.REACH:
          aggregates.totalReach += value;
          break;
        case MetricType.ENGAGEMENT:
          aggregates.totalEngagement += value;
          break;
        case MetricType.ROI:
          aggregates.totalROI += value;
          break;
        case MetricType.FOLLOWERS:
          aggregates.totalFollowers += value;
          break;
        case MetricType.LIKES:
          aggregates.totalLikes += value;
          break;
        case MetricType.COMMENTS:
          aggregates.totalComments += value;
          break;
        case MetricType.SHARES:
          aggregates.totalShares += value;
          break;
        case MetricType.CONVERSIONS:
          aggregates.totalConversions += value;
          break;
        case MetricType.INSTAGRAM_LINK_CLICKS:
          aggregates.instagramLinkClicks += value;
          break;
      }

      if (!aggregates.byType[metric.metricType]) {
        aggregates.byType[metric.metricType] = 0;
      }
      aggregates.byType[metric.metricType] += value;
    });

    return aggregates;
  }

  async computeInfluencerPerformanceScore(
    influencerId: string
  ): Promise<number> {
    const influencer = await this.prisma.influencer.findUnique({
      where: { id: influencerId },
      include: {
        performanceMetrics: true,
      },
    });

    if (!influencer) {
      throw new NotFoundException(
        `Influencer with ID ${influencerId} not found`
      );
    }

    if (influencer.performanceMetrics.length === 0) {
      return 0;
    }

    const metrics = influencer.performanceMetrics;

    // Calculate weighted score
    let totalScore = 0;
    let totalWeight = 0;

    const weights = {
      [MetricType.REACH]: 0.2,
      [MetricType.ENGAGEMENT]: 0.3,
      [MetricType.FOLLOWERS]: 0.15,
      [MetricType.CONVERSIONS]: 0.35,
      [MetricType.ROI]: 0.25,
    };

    metrics.forEach((metric) => {
      const weight = weights[metric.metricType] || 0.1;
      totalScore += Number(metric.value) * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? Math.min(100, (totalScore / totalWeight) * 10) : 0;
  }

  async computeBudgetUtilization(campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        influencerLinks: true,
      },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }

    const budget = Number(campaign.budget || 0);
    const spent = Number(campaign.budgetSpent || 0);
    const allocated = Number(campaign.budgetAllocated || 0);

    if (budget === 0) {
      return {
        campaignId,
        budget: 0,
        spent: 0,
        allocated: 0,
        available: 0,
        utilizationRate: 0,
        allocationRate: 0,
      };
    }

    return {
      campaignId,
      budget,
      spent,
      allocated,
      available: Math.max(0, budget - spent),
      utilizationRate: (spent / budget) * 100,
      allocationRate: (allocated / budget) * 100,
      influencerCount: campaign.influencerLinks.length,
    };
  }

  async getInstagramInsights(influencerId: string) {
    const metrics = await this.prisma.performanceMetric.findMany({
      where: {
        influencerId,
        instagramProfileUrl: { not: null },
      },
      orderBy: {
        recordedAt: 'desc',
      },
      take: 10,
    });

    if (metrics.length === 0) {
      return {
        influencerId,
        hasData: false,
        message: 'No Instagram data available for this influencer',
      };
    }

    const latestMetric = metrics[0];

    return {
      influencerId,
      hasData: true,
      profileUrl: latestMetric.instagramProfileUrl,
      followers: latestMetric.instagramFollowers,
      engagementRate: latestMetric.instagramEngagementRate,
      linkData: latestMetric.instagramLinkData,
      metrics: metrics.map((m) => ({
        recordedAt: m.recordedAt,
        followers: m.instagramFollowers,
        engagementRate: m.instagramEngagementRate,
        linkClicks: (m.instagramLinkData as any)?.clicks || 0,
      })),
    };
  }
}
