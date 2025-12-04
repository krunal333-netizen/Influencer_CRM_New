import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ApifyClient } from 'apify';
import { 
  InstagramProfileData, 
  ApifyRunResult, 
  ApifyRunStatus 
} from './types/apify.types';
import { ScrapeProfileDto } from './dto/scrape-profile.dto';

@Injectable()
export class ApifyService {
  private readonly logger = new Logger(ApifyService.name);
  private readonly apifyClient: ApifyClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('APIFY_API_KEY');
    this.apifyClient = new ApifyClient({
      token: apiKey || undefined,
    });
  }

  async triggerInstagramScrape(dto: ScrapeProfileDto): Promise<string> {
    const { instagramUrl, dryRun = false } = dto;

    if (dryRun) {
      const runId = `dry-run-${Date.now()}`;
      await this.createApifyRunLog(runId, null, ApifyRunStatus.CREATED);
      
      // Simulate async processing for dry run
      setTimeout(async () => {
        await this.updateApifyRunLog(runId, ApifyRunStatus.RUNNING);
        setTimeout(async () => {
          await this.updateApifyRunLog(runId, ApifyRunStatus.SUCCEEDED, 'Dry run completed successfully', 1);
        }, 2000);
      }, 1000);

      return runId;
    }

    const runId = await this.createInstagramScrapeRun(instagramUrl);
    return runId;
  }

  async getRunStatus(runId: string): Promise<any> {
    // Check if it's a dry run
    if (runId.startsWith('dry-run-')) {
      const log = await this.prisma.apifyRunLog.findUnique({
        where: { runId },
      });

      if (!log) {
        throw new Error('Run not found');
      }

      return {
        runId: log.runId,
        status: log.status,
        startedAt: log.startedAt,
        finishedAt: log.finishedAt,
        statusMessage: log.statusMessage,
        resultsCount: log.resultsCount,
        isDryRun: true,
      };
    }

    try {
      const run = await this.apifyClient.run(runId).get();
      
      if (!run) {
        throw new Error('Run not found');
      }
      
      // Update local log
      await this.updateApifyRunLog(
        run.id,
        run.status as ApifyRunStatus,
        run.statusMessage,
        0, // We'll use a default count since stats structure may vary
      );

      return {
        runId: run.id,
        status: run.status,
        startedAt: run.startedAt,
        finishedAt: run.finishedAt,
        statusMessage: run.statusMessage,
        resultsCount: 0, // We'll use a default count since stats structure may vary
        isDryRun: false,
      };
    } catch (error) {
      this.logger.error(`Failed to get run status: ${error.message}`);
      throw new Error('Failed to fetch run status');
    }
  }

  async getRunResults(runId: string): Promise<ApifyRunResult> {
    // Check if it's a dry run
    if (runId.startsWith('dry-run-')) {
      const log = await this.prisma.apifyRunLog.findUnique({
        where: { runId },
      });

      if (!log) {
        throw new Error('Run not found');
      }

      if (log.status !== ApifyRunStatus.SUCCEEDED) {
        throw new Error('Run has not completed yet');
      }

      return this.getMockScrapeResults();
    }

    try {
      // Get Instagram scraper results
      const instagramItems: any[] = [];
      const instagramDataset = await this.apifyClient.dataset(runId).listItems();
      
      if (instagramDataset.items) {
        for (const item of instagramDataset.items) {
          instagramItems.push(item);
        }
      }

      if (instagramItems.length === 0) {
        return {
          profileData: null,
          emails: [],
          success: false,
          error: 'No profile data found',
        };
      }

      const profileData = this.extractInstagramProfileData(instagramItems[0]);

      // Extract emails using the email scraper
      const emails = await this.extractEmails(profileData.profileUrl);

      return {
        profileData,
        emails,
        success: true,
      };
    } catch (error) {
      this.logger.error(`Failed to get run results: ${error.message}`);
      return {
        profileData: null,
        emails: [],
        success: false,
        error: error.message,
      };
    }
  }

  private async createInstagramScrapeRun(instagramUrl: string): Promise<string> {
    try {
      const run = await this.apifyClient.actor('apify/instagram-profile-scraper').call({
        directUrls: [instagramUrl],
        resultsLimit: 1,
      });

      await this.createApifyRunLog(run.id, 'apify/instagram-profile-scraper', ApifyRunStatus.CREATED);
      
      return run.id;
    } catch (error) {
      this.logger.error(`Failed to create Instagram scrape run: ${error.message}`);
      throw new Error('Failed to trigger Instagram scrape');
    }
  }

  private async extractEmails(profileUrl: string): Promise<string[]> {
    try {
      const emailScraperRun = await this.apifyClient.actor('chitosibug3/social-media-email-scraper-2026').call({
        profileUrls: [profileUrl],
        resultsLimit: 10,
      });

      const emails: string[] = [];
      const emailDataset = await this.apifyClient.dataset(emailScraperRun.id).listItems();
      
      if (emailDataset.items) {
        for (const item of emailDataset.items) {
          if ((item as any).email) {
            emails.push((item as any).email);
          }
        }
      }

      return [...new Set(emails)]; // Remove duplicates
    } catch (error) {
      this.logger.warn(`Failed to extract emails: ${error.message}`);
      return [];
    }
  }

  private extractInstagramProfileData(item: any): InstagramProfileData {
    return {
      username: item.username || item.ownerUsername || '',
      fullName: item.fullName || item.ownerFullName || '',
      bio: item.bio || item.description || '',
      followersCount: item.followersCount || item.subscribersCount || 0,
      profilePictureUrl: item.profilePictureUrl || item.ownerProfilePictureUrl || '',
      profileUrl: item.url || item.ownerUrl || '',
    };
  }

  private async createApifyRunLog(
    runId: string, 
    taskId: string | null, 
    status: ApifyRunStatus
  ): Promise<void> {
    try {
      await this.prisma.apifyRunLog.create({
        data: {
          runId,
          taskId,
          status,
          startedAt: status === ApifyRunStatus.RUNNING ? new Date() : null,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create Apify run log: ${error.message}`);
    }
  }

  private async updateApifyRunLog(
    runId: string,
    status: ApifyRunStatus,
    statusMessage?: string,
    resultsCount?: number,
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      if (statusMessage) {
        updateData.statusMessage = statusMessage;
      }

      if (resultsCount !== undefined) {
        updateData.resultsCount = resultsCount;
      }

      if (status === ApifyRunStatus.RUNNING && !updateData.startedAt) {
        updateData.startedAt = new Date();
      }

      if (status === ApifyRunStatus.SUCCEEDED || status === ApifyRunStatus.FAILED) {
        updateData.finishedAt = new Date();
      }

      await this.prisma.apifyRunLog.update({
        where: { runId },
        data: updateData,
      });
    } catch (error) {
      this.logger.error(`Failed to update Apify run log: ${error.message}`);
    }
  }

  private getMockScrapeResults(): ApifyRunResult {
    return {
      profileData: {
        username: 'johndoe',
        fullName: 'John Doe',
        bio: 'Digital creator | Photographer | Travel enthusiast',
        followersCount: 15420,
        profilePictureUrl: 'https://picsum.photos/seed/johndoe/200/200.jpg',
        profileUrl: 'https://www.instagram.com/johndoe',
        emails: ['john.doe@example.com', 'contact@johndoe.com'],
      },
      emails: ['john.doe@example.com', 'contact@johndoe.com'],
      success: true,
    };
  }
}