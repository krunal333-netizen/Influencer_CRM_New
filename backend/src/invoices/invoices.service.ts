import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InvoiceOcrService } from './ocr.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceFilterDto } from './dto/invoice-filter.dto';
import { InvoiceImageStatus } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ocrService: InvoiceOcrService
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, and WebP are allowed.'
      );
    }

    try {
      // Generate unique filename
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
      const uploadDir = path.join(process.cwd(), 'uploads', 'invoices');

      // Ensure directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, file.buffer);

      // Extract OCR data
      const ocrResult = await this.ocrService.extractTextFromImage(filepath);
      const parsedData = this.ocrService.parseOcrText(ocrResult.rawText);

      // Create invoice image record
      const invoice = await this.prisma.invoiceImage.create({
        data: {
          imagePath: filepath,
          status: InvoiceImageStatus.PENDING,
          ocrData: {
            rawText: ocrResult.rawText,
            ...parsedData,
            ...ocrResult.extractedFields,
          },
          extractedTotal: parsedData.totalAmount
            ? parseFloat(parsedData.totalAmount.toString())
            : null,
          campaignId: createInvoiceDto.campaignId,
          productId: createInvoiceDto.productId,
        },
        include: {
          campaign: true,
          product: true,
        },
      });

      return invoice;
    } catch (error) {
      throw new BadRequestException(
        `File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findAll(filterDto: InvoiceFilterDto = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      campaignId,
      productId,
      search,
      dateFrom,
      dateTo,
    } = filterDto;

    const where = {
      ...(status && { status }),
      ...(campaignId && { campaignId }),
      ...(productId && { productId }),
      ...(search && {
        OR: [{ imagePath: { contains: search, mode: 'insensitive' as const } }],
      }),
      ...(dateFrom &&
        dateTo && {
          createdAt: {
            gte: new Date(dateFrom),
            lte: new Date(dateTo),
          },
        }),
    };

    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      this.prisma.invoiceImage.findMany({
        where,
        include: {
          campaign: true,
          product: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.invoiceImage.count({ where }),
    ]);

    return {
      data: invoices,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoiceImage.findUnique({
      where: { id },
      include: {
        campaign: true,
        product: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto) {
    await this.findOne(id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};

    if (updateInvoiceDto.status) {
      // Validate status transitions
      const currentInvoice = await this.findOne(id);
      this.validateStatusTransition(
        currentInvoice.status,
        updateInvoiceDto.status
      );
      updateData.status = updateInvoiceDto.status;
    }

    if (updateInvoiceDto.ocrData) {
      updateData.ocrData = updateInvoiceDto.ocrData;
    }

    if (updateInvoiceDto.extractedTotal !== undefined) {
      updateData.extractedTotal = updateInvoiceDto.extractedTotal;
    }

    if (updateInvoiceDto.campaignId) {
      updateData.campaignId = updateInvoiceDto.campaignId;
    }

    if (updateInvoiceDto.productId) {
      updateData.productId = updateInvoiceDto.productId;
    }

    return this.prisma.invoiceImage.update({
      where: { id },
      data: updateData,
      include: {
        campaign: true,
        product: true,
      },
    });
  }

  async remove(id: string) {
    const invoice = await this.findOne(id);

    // Delete file
    if (fs.existsSync(invoice.imagePath)) {
      fs.unlinkSync(invoice.imagePath);
    }

    return this.prisma.invoiceImage.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, status: InvoiceImageStatus) {
    const invoice = await this.findOne(id);
    this.validateStatusTransition(invoice.status, status);

    return this.prisma.invoiceImage.update({
      where: { id },
      data: { status },
      include: {
        campaign: true,
        product: true,
      },
    });
  }

  private validateStatusTransition(
    currentStatus: InvoiceImageStatus,
    newStatus: InvoiceImageStatus
  ): void {
    const validTransitions: Record<InvoiceImageStatus, InvoiceImageStatus[]> = {
      [InvoiceImageStatus.PENDING]: [
        InvoiceImageStatus.PROCESSING,
        InvoiceImageStatus.FAILED,
      ],
      [InvoiceImageStatus.PROCESSING]: [
        InvoiceImageStatus.PROCESSED,
        InvoiceImageStatus.FAILED,
      ],
      [InvoiceImageStatus.PROCESSED]: [InvoiceImageStatus.PENDING],
      [InvoiceImageStatus.FAILED]: [InvoiceImageStatus.PENDING],
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`
      );
    }
  }

  async getInvoicesByStatus(status: InvoiceImageStatus) {
    return this.prisma.invoiceImage.findMany({
      where: { status },
      include: {
        campaign: true,
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getInvoicesByCampaign(campaignId: string) {
    return this.prisma.invoiceImage.findMany({
      where: { campaignId },
      include: {
        campaign: true,
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async linkToCampaign(invoiceId: string, campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }

    return this.prisma.invoiceImage.update({
      where: { id: invoiceId },
      data: { campaignId },
      include: {
        campaign: true,
        product: true,
      },
    });
  }

  async linkToProduct(invoiceId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return this.prisma.invoiceImage.update({
      where: { id: invoiceId },
      data: { productId },
      include: {
        campaign: true,
        product: true,
      },
    });
  }
}
