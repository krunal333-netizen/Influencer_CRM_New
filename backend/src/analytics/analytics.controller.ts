import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CreatePerformanceMetricDto } from './dto/create-performance-metric.dto';
import { PerformanceMetricFilterDto } from './dto/performance-metric-filter.dto';
import { AnalyticsAggregationDto } from './dto/analytics-aggregation.dto';
import { AccessTokenGuard } from '../common/guards/access-token.guard';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('metrics')
  @ApiOperation({
    summary: 'Record performance metric',
    description:
      'Record campaign/influencer performance metrics (reach, engagement, ROI, etc.)',
  })
  async recordMetric(@Body() dto: CreatePerformanceMetricDto) {
    return this.analyticsService.recordPerformanceMetric(dto);
  }

  @Get('metrics')
  @ApiOperation({
    summary: 'List performance metrics',
    description: 'Retrieve performance metrics with optional filters',
  })
  async getMetrics(@Query() filterDto: PerformanceMetricFilterDto) {
    return this.analyticsService.findAll(filterDto);
  }

  @Get('metrics/:id')
  @ApiOperation({
    summary: 'Get metric details',
    description: 'Retrieve details of a specific performance metric',
  })
  async getMetric(@Param('id') id: string) {
    return this.analyticsService.findOne(id);
  }

  @Delete('metrics/:id')
  @ApiOperation({
    summary: 'Delete metric',
    description: 'Delete a performance metric',
  })
  async deleteMetric(@Param('id') id: string) {
    return this.analyticsService.remove(id);
  }

  @Get('aggregated')
  @ApiOperation({
    summary: 'Get aggregated analytics',
    description:
      'Get aggregated metrics by store, firm, influencer, or campaign for a date range',
  })
  async getAggregatedAnalytics(@Query() dto: AnalyticsAggregationDto) {
    return this.analyticsService.getAggregatedAnalytics(dto);
  }

  @Get('store/:storeId/aggregated')
  @ApiOperation({
    summary: 'Get store analytics aggregation',
    description: 'Get aggregated metrics for a specific store',
  })
  async getStoreAnalytics(
    @Param('storeId') storeId: string,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string
  ) {
    return this.analyticsService.aggregateMetricsByStore(
      storeId,
      new Date(dateFrom),
      new Date(dateTo)
    );
  }

  @Get('firm/:firmId/aggregated')
  @ApiOperation({
    summary: 'Get firm analytics aggregation',
    description: 'Get aggregated metrics for all stores under a firm',
  })
  async getFirmAnalytics(
    @Param('firmId') firmId: string,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string
  ) {
    return this.analyticsService.aggregateMetricsByFirm(
      firmId,
      new Date(dateFrom),
      new Date(dateTo)
    );
  }

  @Get('influencer/:influencerId/score')
  @ApiOperation({
    summary: 'Get influencer performance score',
    description: 'Calculate weighted performance score for an influencer',
  })
  async getInfluencerScore(@Param('influencerId') influencerId: string) {
    const score =
      await this.analyticsService.computeInfluencerPerformanceScore(
        influencerId
      );
    return { influencerId, performanceScore: score };
  }

  @Get('influencer/:influencerId/instagram')
  @ApiOperation({
    summary: 'Get Instagram insights',
    description: 'Get Apify-sourced Instagram data for an influencer',
  })
  async getInstagramInsights(@Param('influencerId') influencerId: string) {
    return this.analyticsService.getInstagramInsights(influencerId);
  }

  @Get('campaign/:campaignId/budget-utilization')
  @ApiOperation({
    summary: 'Get budget utilization',
    description: 'Calculate budget utilization metrics for a campaign',
  })
  async getBudgetUtilization(@Param('campaignId') campaignId: string) {
    return this.analyticsService.computeBudgetUtilization(campaignId);
  }
}
