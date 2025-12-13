import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFinancialDocumentDto } from './dto/create-financial-document.dto';
import { UpdateFinancialDocumentDto } from './dto/update-financial-document.dto';
import { FinancialDocumentFilterDto } from './dto/financial-document-filter.dto';

@Injectable()
export class FinancialDocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateFinancialDocumentDto) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: createDto.campaignId },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${createDto.campaignId} not found`);
    }

    const existing = await this.prisma.financialDocument.findUnique({
      where: { documentNumber: createDto.documentNumber },
    });

    if (existing) {
      throw new BadRequestException(`Document number ${createDto.documentNumber} already exists`);
    }

    return this.prisma.financialDocument.create({
      data: {
        type: createDto.type,
        documentNumber: createDto.documentNumber,
        amount: createDto.amount,
        status: createDto.status || 'PENDING',
        issueDate: new Date(createDto.issueDate),
        dueDate: createDto.dueDate ? new Date(createDto.dueDate) : null,
        paidDate: createDto.paidDate ? new Date(createDto.paidDate) : null,
        description: createDto.description,
        metadata: createDto.metadata,
        filePath: createDto.filePath,
        campaignId: createDto.campaignId,
      },
      include: {
        campaign: {
          include: {
            store: true,
          },
        },
      },
    });
  }

  async findAll(filterDto: FinancialDocumentFilterDto) {
    const { page = 1, limit = 10, type, status, campaignId, issueDateFrom, issueDateTo, dueDateFrom, dueDateTo, search } = filterDto;
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (campaignId) {
      where.campaignId = campaignId;
    }

    if (issueDateFrom || issueDateTo) {
      where.issueDate = {};
      if (issueDateFrom) {
        where.issueDate.gte = new Date(issueDateFrom);
      }
      if (issueDateTo) {
        where.issueDate.lte = new Date(issueDateTo);
      }
    }

    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) {
        where.dueDate.gte = new Date(dueDateFrom);
      }
      if (dueDateTo) {
        where.dueDate.lte = new Date(dueDateTo);
      }
    }

    if (search) {
      where.OR = [
        { documentNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [documents, total] = await Promise.all([
      this.prisma.financialDocument.findMany({
        where,
        skip,
        take: limit,
        include: {
          campaign: {
            include: {
              store: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.financialDocument.count({ where }),
    ]);

    return {
      data: documents,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const document = await this.prisma.financialDocument.findUnique({
      where: { id },
      include: {
        campaign: {
          include: {
            store: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException(`Financial document with ID ${id} not found`);
    }

    return document;
  }

  async update(id: string, updateDto: UpdateFinancialDocumentDto) {
    const document = await this.prisma.financialDocument.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException(`Financial document with ID ${id} not found`);
    }

    if (updateDto.campaignId) {
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: updateDto.campaignId },
      });

      if (!campaign) {
        throw new NotFoundException(`Campaign with ID ${updateDto.campaignId} not found`);
      }
    }

    if (updateDto.documentNumber && updateDto.documentNumber !== document.documentNumber) {
      const existing = await this.prisma.financialDocument.findUnique({
        where: { documentNumber: updateDto.documentNumber },
      });

      if (existing) {
        throw new BadRequestException(`Document number ${updateDto.documentNumber} already exists`);
      }
    }

    return this.prisma.financialDocument.update({
      where: { id },
      data: {
        ...(updateDto.type && { type: updateDto.type }),
        ...(updateDto.documentNumber && { documentNumber: updateDto.documentNumber }),
        ...(updateDto.amount !== undefined && { amount: updateDto.amount }),
        ...(updateDto.status && { status: updateDto.status }),
        ...(updateDto.issueDate && { issueDate: new Date(updateDto.issueDate) }),
        ...(updateDto.dueDate !== undefined && { dueDate: updateDto.dueDate ? new Date(updateDto.dueDate) : null }),
        ...(updateDto.paidDate !== undefined && { paidDate: updateDto.paidDate ? new Date(updateDto.paidDate) : null }),
        ...(updateDto.description !== undefined && { description: updateDto.description }),
        ...(updateDto.metadata !== undefined && { metadata: updateDto.metadata }),
        ...(updateDto.filePath !== undefined && { filePath: updateDto.filePath }),
        ...(updateDto.campaignId && { campaignId: updateDto.campaignId }),
      },
      include: {
        campaign: {
          include: {
            store: true,
          },
        },
      },
    });
  }

  async updateStatus(id: string, status: string) {
    const document = await this.prisma.financialDocument.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException(`Financial document with ID ${id} not found`);
    }

    return this.prisma.financialDocument.update({
      where: { id },
      data: { status },
      include: {
        campaign: {
          include: {
            store: true,
          },
        },
      },
    });
  }

  async markAsPaid(id: string, paidDate?: string) {
    const document = await this.prisma.financialDocument.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException(`Financial document with ID ${id} not found`);
    }

    return this.prisma.financialDocument.update({
      where: { id },
      data: {
        status: 'PAID',
        paidDate: paidDate ? new Date(paidDate) : new Date(),
      },
      include: {
        campaign: {
          include: {
            store: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const document = await this.prisma.financialDocument.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException(`Financial document with ID ${id} not found`);
    }

    await this.prisma.financialDocument.delete({
      where: { id },
    });
  }

  async getStatsByType() {
    const documents = await this.prisma.financialDocument.findMany({
      select: {
        type: true,
        amount: true,
        status: true,
      },
    });

    const stats = {
      PO: { count: 0, total: 0, paid: 0, pending: 0 },
      INVOICE: { count: 0, total: 0, paid: 0, pending: 0 },
      FORM: { count: 0, total: 0, paid: 0, pending: 0 },
    };

    documents.forEach((doc) => {
      const type = doc.type;
      stats[type].count += 1;
      stats[type].total += Number(doc.amount);

      if (doc.status === 'PAID') {
        stats[type].paid += Number(doc.amount);
      } else {
        stats[type].pending += Number(doc.amount);
      }
    });

    return stats;
  }

  async getStatsByFirm() {
    const documents = await this.prisma.financialDocument.findMany({
      include: {
        campaign: {
          include: {
            store: {
              include: {
                firm: true,
              },
            },
          },
        },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const firmStats: Record<string, any> = {};

    documents.forEach((doc) => {
      const firmId = doc.campaign?.store?.firm?.id;
      const firmName = doc.campaign?.store?.firm?.name || 'Unknown';

      if (!firmId) return;

      if (!firmStats[firmId]) {
        firmStats[firmId] = {
          firmId,
          firmName,
          count: 0,
          total: 0,
          paid: 0,
          pending: 0,
        };
      }

      firmStats[firmId].count += 1;
      firmStats[firmId].total += Number(doc.amount);

      if (doc.status === 'PAID') {
        firmStats[firmId].paid += Number(doc.amount);
      } else {
        firmStats[firmId].pending += Number(doc.amount);
      }
    });

    return Object.values(firmStats);
  }
}
