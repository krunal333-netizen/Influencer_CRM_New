import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApifyService } from '../apify/apify.service';
import { CreateInfluencerDto } from './dto/create-influencer.dto';
import { UpdateInfluencerDto } from './dto/update-influencer.dto';
import { InstagramProfileData } from '../apify/types/apify.types';

@Injectable()
export class InfluencersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly apifyService: ApifyService
  ) {}

  async create(createInfluencerDto: CreateInfluencerDto) {
    return this.prisma.influencer.create({
      data: createInfluencerDto,
    });
  }

  async findAll() {
    return this.prisma.influencer.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const influencer = await this.prisma.influencer.findUnique({
      where: { id },
      include: {
        campaignLinks: {
          include: {
            campaign: true,
          },
        },
      },
    });

    if (!influencer) {
      throw new NotFoundException(`Influencer with ID ${id} not found`);
    }

    return influencer;
  }

  async update(id: string, updateInfluencerDto: UpdateInfluencerDto) {
    await this.findOne(id); // Check if exists

    return this.prisma.influencer.update({
      where: { id },
      data: updateInfluencerDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    return this.prisma.influencer.delete({
      where: { id },
    });
  }

  async createFromScrapedData(
    scrapedData: InstagramProfileData,
    additionalData: Partial<CreateInfluencerDto> = {}
  ): Promise<Record<string, unknown>> {
    // Check for duplicate email
    if (scrapedData.emails && scrapedData.emails.length > 0) {
      const existingInfluencer = await this.prisma.influencer.findUnique({
        where: { email: scrapedData.emails[0] },
      });

      if (existingInfluencer) {
        throw new ConflictException(
          `Influencer with email ${scrapedData.emails[0]} already exists`
        );
      }
    }

    const influencerData: CreateInfluencerDto = {
      name: scrapedData.fullName || scrapedData.username,
      email: scrapedData.emails?.[0] || `${scrapedData.username}@instagram.com`,
      followers: scrapedData.followersCount,
      bio: scrapedData.bio,
      platform: 'Instagram',
      profileUrl: scrapedData.profileUrl,
      ...additionalData,
    };

    return this.create(influencerData);
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const existingInfluencer = await this.prisma.influencer.findUnique({
      where: { email },
    });

    return !!existingInfluencer;
  }
}
