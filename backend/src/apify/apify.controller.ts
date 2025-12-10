import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ApifyService } from './apify.service';
import { ScrapeProfileDto } from './dto/scrape-profile.dto';
import { AccessTokenGuard } from '../common/guards/access-token.guard';

@ApiTags('apify')
@Controller('apify')
@UseGuards(AccessTokenGuard)
export class ApifyController {
  constructor(private readonly apifyService: ApifyService) {}

  @Post('scrape-profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Trigger Instagram profile scraping',
    description:
      'Starts an Instagram profile scraping job. Supports dry-run mode for testing without API credentials.',
  })
  @ApiResponse({
    status: 200,
    description: 'Scraping job started successfully',
    schema: {
      type: 'object',
      properties: {
        runId: {
          type: 'string',
          description: 'Unique identifier for the scraping job',
          example: 'dry-run-1701234567890',
        },
        message: {
          type: 'string',
          example: 'Scraping job started',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid Instagram URL' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async scrapeProfile(@Body() scrapeProfileDto: ScrapeProfileDto) {
    const runId =
      await this.apifyService.triggerInstagramScrape(scrapeProfileDto);

    return {
      runId,
      message: 'Scraping job started',
    };
  }

  @Get('run/:runId/status')
  @ApiOperation({
    summary: 'Get scraping job status',
    description: 'Retrieves the current status of a scraping job.',
  })
  @ApiParam({
    name: 'runId',
    description: 'The ID of the scraping job',
    example: 'dry-run-1701234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        runId: { type: 'string' },
        status: {
          type: 'string',
          enum: [
            'CREATED',
            'READY',
            'RUNNING',
            'SUCCEEDED',
            'FAILED',
            'TIMED_OUT',
            'ABORTED',
          ],
        },
        startedAt: { type: 'string', format: 'date-time' },
        finishedAt: { type: 'string', format: 'date-time' },
        statusMessage: { type: 'string' },
        resultsCount: { type: 'number' },
        isDryRun: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Run not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRunStatus(@Param('runId') runId: string) {
    return this.apifyService.getRunStatus(runId);
  }

  @Get('run/:runId/results')
  @ApiOperation({
    summary: 'Get scraping job results',
    description:
      'Retrieves the results of a completed scraping job including profile data and extracted emails.',
  })
  @ApiParam({
    name: 'runId',
    description: 'The ID of the scraping job',
    example: 'dry-run-1701234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Results retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        profileData: {
          type: 'object',
          properties: {
            username: { type: 'string' },
            fullName: { type: 'string' },
            bio: { type: 'string' },
            followersCount: { type: 'number' },
            profilePictureUrl: { type: 'string' },
            profileUrl: { type: 'string' },
            emails: { type: 'array', items: { type: 'string' } },
          },
        },
        emails: { type: 'array', items: { type: 'string' } },
        success: { type: 'boolean' },
        error: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Run has not completed yet' })
  @ApiResponse({ status: 404, description: 'Run not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRunResults(@Param('runId') runId: string) {
    return this.apifyService.getRunResults(runId);
  }
}
