import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCampaignDto: CreateCampaignDto) {
    const { startDate, endDate, ...rest } = createCampaignDto;

    return this.prisma.campaign.create({
      data: {
        ...rest,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        store: true,
      },
    });
  }

  async findAll() {
    return this.prisma.campaign.findMany({
      include: {
        store: true,
        products: {
          include: {
            product: true,
          },
        },
        influencerLinks: {
          include: {
            influencer: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        store: true,
        products: {
          include: {
            product: true,
          },
        },
        influencerLinks: {
          include: {
            influencer: true,
          },
        },
        financialDocuments: true,
      },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return campaign;
  }

  async update(id: string, updateCampaignDto: UpdateCampaignDto) {
    await this.findOne(id); // Check if exists

    const { startDate, endDate, ...rest } = updateCampaignDto;

    return this.prisma.campaign.update({
      where: { id },
      data: {
        ...rest,
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
      },
      include: {
        store: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    return this.prisma.campaign.delete({
      where: { id },
    });
  }
}
