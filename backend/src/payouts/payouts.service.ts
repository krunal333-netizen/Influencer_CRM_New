import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { UpdatePayoutDto } from './dto/update-payout.dto';
import { PayoutFilterDto } from './dto/payout-filter.dto';
import { CreateDocumentLinkDto } from './dto/create-document-link.dto';
import { PaymentStatus } from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StatusHistoryEntry = any;

@Injectable()
export class PayoutsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPayout(dto: CreatePayoutDto) {
    // Validate references
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

    const initialHistory = [
      {
        status: PaymentStatus.PENDING,
        timestamp: new Date().toISOString(),
        notes: 'Payout created',
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createData: any = {
      type: dto.type,
      amount: dto.amount,
      currency: dto.currency || 'USD',
      status: PaymentStatus.PENDING,
      influencerId: dto.influencerId,
      campaignId: dto.campaignId,
      invoiceId: dto.invoiceId,
      poId: dto.poId,
      notes: dto.notes,
      statusHistory: initialHistory,
    };

    if (dto.metadata) {
      createData.metadata = dto.metadata;
    }

    return this.prisma.payout.create({
      data: createData,
      include: {
        influencer: true,
        campaign: {
          include: {
            store: true,
          },
        },
      },
    });
  }

  async findAll(filterDto: PayoutFilterDto = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      influencerId,
      campaignId,
      dateFrom,
      dateTo,
    } = filterDto;

    const where = {
      ...(status && { status }),
      ...(type && { type }),
      ...(influencerId && { influencerId }),
      ...(campaignId && { campaignId }),
      ...(dateFrom &&
        dateTo && {
          requestedAt: {
            gte: new Date(dateFrom),
            lte: new Date(dateTo),
          },
        }),
    };

    const skip = (page - 1) * limit;

    const [payouts, total] = await Promise.all([
      this.prisma.payout.findMany({
        where,
        include: {
          influencer: true,
          campaign: {
            include: {
              store: true,
            },
          },
        },
        orderBy: {
          requestedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.payout.count({ where }),
    ]);

    return {
      data: payouts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const payout = await this.prisma.payout.findUnique({
      where: { id },
      include: {
        influencer: true,
        campaign: {
          include: {
            store: true,
          },
        },
      },
    });

    if (!payout) {
      throw new NotFoundException(`Payout with ID ${id} not found`);
    }

    return payout;
  }

  async updatePayout(id: string, dto: UpdatePayoutDto) {
    const payout = await this.findOne(id);

    const updateData: Record<string, unknown> = {};

    if (dto.status && dto.status !== payout.status) {
      updateData.status = dto.status;

      // Update status history
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const history = ((payout.statusHistory as any) || []) as any[];
      history.push({
        status: dto.status,
        timestamp: new Date().toISOString(),
        notes: dto.notes || `Status changed to ${dto.status}`,
      });
      updateData.statusHistory = history;

      // Update timestamp fields based on status
      switch (dto.status) {
        case PaymentStatus.APPROVED:
          updateData.approvedAt = new Date();
          break;
        case PaymentStatus.PROCESSING:
          updateData.processedAt = new Date();
          break;
        case PaymentStatus.PAID:
          updateData.paidAt = new Date();
          break;
        case PaymentStatus.FAILED:
          updateData.failedAt = new Date();
          break;
      }
    }

    if (dto.amount !== undefined) {
      updateData.amount = dto.amount;
    }

    if (dto.notes !== undefined) {
      updateData.notes = dto.notes;
    }

    if (dto.metadata !== undefined) {
      updateData.metadata = dto.metadata;
    }

    return this.prisma.payout.update({
      where: { id },
      data: updateData,
      include: {
        influencer: true,
        campaign: {
          include: {
            store: true,
          },
        },
      },
    });
  }

  async updatePaymentStatus(id: string, status: PaymentStatus, notes?: string) {
    const dto = new UpdatePayoutDto();
    dto.status = status;
    dto.notes = notes;

    return this.updatePayout(id, dto);
  }

  async removePayout(id: string) {
    await this.findOne(id);
    return this.prisma.payout.delete({
      where: { id },
    });
  }

  async getPaymentTimeline(payoutId: string) {
    const payout = await this.findOne(payoutId);

    return {
      payoutId,
      amount: payout.amount,
      type: payout.type,
      status: payout.status,
      timeline: {
        requested: payout.requestedAt,
        approved: payout.approvedAt,
        processing: payout.processedAt,
        paid: payout.paidAt,
        failed: payout.failedAt,
      },
      history: payout.statusHistory,
    };
  }

  async getPayoutsByInfluencer(influencerId: string) {
    const influencer = await this.prisma.influencer.findUnique({
      where: { id: influencerId },
    });

    if (!influencer) {
      throw new NotFoundException(
        `Influencer with ID ${influencerId} not found`
      );
    }

    const payouts = await this.prisma.payout.findMany({
      where: { influencerId },
      include: {
        campaign: {
          include: {
            store: true,
          },
        },
      },
      orderBy: {
        requestedAt: 'desc',
      },
    });

    // Calculate summary stats
    const stats = {
      totalPayouts: payouts.length,
      totalAmount: 0,
      byStatus: {} as Record<string, number>,
      byType: {} as Record<string, number>,
    };

    payouts.forEach((payout) => {
      stats.totalAmount += Number(payout.amount);

      if (!stats.byStatus[payout.status]) {
        stats.byStatus[payout.status] = 0;
      }
      stats.byStatus[payout.status] += 1;

      if (!stats.byType[payout.type]) {
        stats.byType[payout.type] = 0;
      }
      stats.byType[payout.type] += 1;
    });

    return {
      influencerId,
      stats,
      payouts,
    };
  }

  async getPayoutsByCampaign(campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        store: true,
      },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }

    const payouts = await this.prisma.payout.findMany({
      where: { campaignId },
      include: {
        influencer: true,
      },
      orderBy: {
        requestedAt: 'desc',
      },
    });

    const stats = {
      campaignId,
      campaignName: campaign.name,
      totalPayouts: payouts.length,
      totalAmount: 0,
      budgetUtilization: 0,
      byStatus: {} as Record<string, number>,
    };

    payouts.forEach((payout) => {
      stats.totalAmount += Number(payout.amount);

      if (!stats.byStatus[payout.status]) {
        stats.byStatus[payout.status] = 0;
      }
      stats.byStatus[payout.status] += 1;
    });

    if (campaign.budget) {
      stats.budgetUtilization =
        (stats.totalAmount / Number(campaign.budget)) * 100;
    }

    return {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        budget: campaign.budget,
      },
      stats,
      payouts,
    };
  }

  async linkDocuments(dto: CreateDocumentLinkDto) {
    const validTypes = ['INVOICE', 'PO', 'PAYOUT'];

    if (!validTypes.includes(dto.primaryDocumentType)) {
      throw new BadRequestException(
        `Invalid primary document type. Must be one of: ${validTypes.join(', ')}`
      );
    }

    if (!validTypes.includes(dto.linkedDocumentType)) {
      throw new BadRequestException(
        `Invalid linked document type. Must be one of: ${validTypes.join(', ')}`
      );
    }

    // Check if link already exists
    const existing = await this.prisma.documentLink.findUnique({
      where: {
        primaryDocumentId_linkedDocumentId: {
          primaryDocumentId: dto.primaryDocumentId,
          linkedDocumentId: dto.linkedDocumentId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Document link already exists');
    }

    return this.prisma.documentLink.create({
      data: {
        primaryDocumentId: dto.primaryDocumentId,
        primaryDocumentType: dto.primaryDocumentType,
        linkedDocumentId: dto.linkedDocumentId,
        linkedDocumentType: dto.linkedDocumentType,
        relationship: dto.relationship,
        notes: dto.notes,
      },
    });
  }

  async getDocumentLinks(documentId: string) {
    const links = await this.prisma.documentLink.findMany({
      where: {
        OR: [
          { primaryDocumentId: documentId },
          { linkedDocumentId: documentId },
        ],
      },
    });

    return {
      documentId,
      links,
    };
  }

  async removeDocumentLink(linkId: string) {
    const link = await this.prisma.documentLink.findUnique({
      where: { id: linkId },
    });

    if (!link) {
      throw new NotFoundException(`Document link with ID ${linkId} not found`);
    }

    return this.prisma.documentLink.delete({
      where: { id: linkId },
    });
  }

  async getAuditTrail(payoutId: string) {
    const payout = await this.findOne(payoutId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const history = ((payout.statusHistory as any) || []) as any[];

    return {
      payoutId,
      amount: payout.amount,
      type: payout.type,
      createdAt: payout.createdAt,
      auditTrail: history.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ),
    };
  }
}
