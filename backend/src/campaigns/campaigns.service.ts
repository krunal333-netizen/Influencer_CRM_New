import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CampaignFilterDto } from './dto/campaign-filter.dto';

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCampaignDto: CreateCampaignDto) {
    const { startDate, endDate, deliverableDeadline, ...rest } =
      createCampaignDto;

    return this.prisma.campaign.create({
      data: {
        ...rest,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        deliverableDeadline: deliverableDeadline
          ? new Date(deliverableDeadline)
          : null,
      },
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
    });
  }

  async findAll(filterDto: CampaignFilterDto = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      storeId,
      startDateFrom,
      startDateTo,
      endDateFrom,
      endDateTo,
      search,
    } = filterDto;

    const where = {
      ...(status && { status }),
      ...(type && { type }),
      ...(storeId && { storeId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...((startDateFrom || startDateTo) && {
        startDate: {
          ...(startDateFrom && { gte: new Date(startDateFrom) }),
          ...(startDateTo && { lte: new Date(startDateTo) }),
        },
      }),
      ...((endDateFrom || endDateTo) && {
        endDate: {
          ...(endDateFrom && { gte: new Date(endDateFrom) }),
          ...(endDateTo && { lte: new Date(endDateTo) }),
        },
      }),
    };

    const skip = (page - 1) * limit;

    const [campaigns, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
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
        skip,
        take: limit,
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return {
      data: campaigns,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
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

    const { startDate, endDate, deliverableDeadline, ...rest } =
      updateCampaignDto;

    return this.prisma.campaign.update({
      where: { id },
      data: {
        ...rest,
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(deliverableDeadline && {
          deliverableDeadline: new Date(deliverableDeadline),
        }),
      },
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
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    return this.prisma.campaign.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);

    return this.prisma.campaign.update({
      where: { id },
      data: { status },
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
    });
  }
}
