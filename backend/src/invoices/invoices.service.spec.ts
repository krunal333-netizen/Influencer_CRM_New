import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesService } from './invoices.service';
import { InvoiceOcrService } from './ocr.service';
import { PrismaService } from '../prisma/prisma.service';
import { InvoiceImageStatus } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';

jest.mock('fs');

describe('InvoicesService', () => {
  let service: InvoicesService;

  const mockPrismaService = {
    invoiceImage: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    campaign: {
      findUnique: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
  };

  const mockOcrService = {
    extractTextFromImage: jest.fn(),
    parseOcrText: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: InvoiceOcrService,
          useValue: mockOcrService,
        },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an invoice with file upload', async () => {
      const file = {
        originalname: 'test.png',
        mimetype: 'image/png',
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      const dto = {
        campaignId: 'camp1',
        productId: 'prod1',
      };

      const mockInvoice = {
        id: 'inv1',
        imagePath: '/path/to/image.png',
        ocrData: { asCode: 'AS123456' },
        extractedTotal: 100.0,
        status: InvoiceImageStatus.PENDING,
        campaignId: 'camp1',
        productId: 'prod1',
        campaign: null,
        product: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
      (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);

      mockOcrService.extractTextFromImage.mockResolvedValue({
        rawText: 'Invoice data',
        extractedFields: { asCode: 'AS123456' },
      });

      mockOcrService.parseOcrText.mockReturnValue({
        asCode: 'AS123456',
        productDescription: 'Product',
        unitPrice: 50,
        totalAmount: 100,
      });

      mockPrismaService.invoiceImage.create.mockResolvedValue(mockInvoice);

      const result = await service.create(dto, file);

      expect(result).toEqual(mockInvoice);
      expect(mockPrismaService.invoiceImage.create).toHaveBeenCalled();
    });

    it('should throw error if no file uploaded', async () => {
      const dto = { campaignId: 'camp1' };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(service.create(dto, null as any)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should reject invalid file types', async () => {
      const file = {
        originalname: 'test.txt',
        mimetype: 'text/plain',
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      const dto = { campaignId: 'camp1' };

      await expect(service.create(dto, file)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated invoices', async () => {
      const mockInvoices = [
        {
          id: 'inv1',
          status: InvoiceImageStatus.PENDING,
          campaignId: 'camp1',
          productId: 'prod1',
        },
      ];

      mockPrismaService.invoiceImage.findMany.mockResolvedValue(mockInvoices);
      mockPrismaService.invoiceImage.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(mockInvoices);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter invoices by status', async () => {
      mockPrismaService.invoiceImage.findMany.mockResolvedValue([]);
      mockPrismaService.invoiceImage.count.mockResolvedValue(0);

      await service.findAll({ status: InvoiceImageStatus.PROCESSED });

      expect(mockPrismaService.invoiceImage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: InvoiceImageStatus.PROCESSED,
          }),
        })
      );
    });
  });

  describe('findOne', () => {
    it('should return an invoice by id', async () => {
      const mockInvoice = { id: 'inv1', status: InvoiceImageStatus.PENDING };
      mockPrismaService.invoiceImage.findUnique.mockResolvedValue(mockInvoice);

      const result = await service.findOne('inv1');

      expect(result).toEqual(mockInvoice);
    });

    it('should throw NotFoundException if invoice not found', async () => {
      mockPrismaService.invoiceImage.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('updateStatus', () => {
    it('should update status with valid transition', async () => {
      const mockInvoice = {
        id: 'inv1',
        status: InvoiceImageStatus.PENDING,
      };

      mockPrismaService.invoiceImage.findUnique.mockResolvedValue(mockInvoice);
      mockPrismaService.invoiceImage.update.mockResolvedValue({
        ...mockInvoice,
        status: InvoiceImageStatus.PROCESSING,
      });

      const result = await service.updateStatus(
        'inv1',
        InvoiceImageStatus.PROCESSING
      );

      expect(result.status).toBe(InvoiceImageStatus.PROCESSING);
    });

    it('should reject invalid status transition', async () => {
      const mockInvoice = {
        id: 'inv1',
        status: InvoiceImageStatus.PROCESSED,
      };

      mockPrismaService.invoiceImage.findUnique.mockResolvedValue(mockInvoice);

      // PROCESSED can only transition to PENDING, not to PROCESSING
      await expect(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        service.updateStatus('inv1', InvoiceImageStatus.PROCESSING as any)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('linkToCampaign', () => {
    it('should link invoice to campaign', async () => {
      mockPrismaService.campaign.findUnique.mockResolvedValue({ id: 'camp1' });
      mockPrismaService.invoiceImage.update.mockResolvedValue({
        id: 'inv1',
        campaignId: 'camp1',
      });

      const result = await service.linkToCampaign('inv1', 'camp1');

      expect(result.campaignId).toBe('camp1');
    });

    it('should throw error if campaign not found', async () => {
      mockPrismaService.campaign.findUnique.mockResolvedValue(null);

      await expect(
        service.linkToCampaign('inv1', 'nonexistent')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('linkToProduct', () => {
    it('should link invoice to product', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue({ id: 'prod1' });
      mockPrismaService.invoiceImage.update.mockResolvedValue({
        id: 'inv1',
        productId: 'prod1',
      });

      const result = await service.linkToProduct('inv1', 'prod1');

      expect(result.productId).toBe('prod1');
    });

    it('should throw error if product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(
        service.linkToProduct('inv1', 'nonexistent')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete invoice and remove file', async () => {
      const mockInvoice = {
        id: 'inv1',
        imagePath: '/path/to/image.png',
      };

      mockPrismaService.invoiceImage.findUnique.mockResolvedValue(mockInvoice);
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);
      mockPrismaService.invoiceImage.delete.mockResolvedValue(mockInvoice);

      const result = await service.remove('inv1');

      expect(result).toEqual(mockInvoice);
      expect(fs.unlinkSync).toHaveBeenCalledWith('/path/to/image.png');
    });
  });
});
