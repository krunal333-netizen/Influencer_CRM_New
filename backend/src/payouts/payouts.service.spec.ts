import { Test, TestingModule } from '@nestjs/testing';
import { PayoutsService } from './payouts.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PayoutType, PaymentStatus } from '@prisma/client';

describe('PayoutsService', () => {
  let service: PayoutsService;
  let prisma: PrismaService;

  const mockInfluencer = {
    id: 'inf-1',
    name: 'Test Influencer',
    email: 'test@example.com',
  };

  const mockCampaign = {
    id: 'camp-1',
    name: 'Test Campaign',
    budget: 5000,
  };

  const mockPayout = {
    id: 'payout-1',
    type: PayoutType.INFLUENCER_COMMISSION,
    amount: 500,
    status: PaymentStatus.PENDING,
    influencerId: 'inf-1',
    campaignId: 'camp-1',
    requestedAt: new Date(),
    statusHistory: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayoutsService,
        {
          provide: PrismaService,
          useValue: {
            payout: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            influencer: {
              findUnique: jest.fn(),
            },
            campaign: {
              findUnique: jest.fn(),
            },
            documentLink: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PayoutsService>(PayoutsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('createPayout', () => {
    it('should create a payout', async () => {
      const dto = {
        type: PayoutType.INFLUENCER_COMMISSION,
        amount: 500,
        influencerId: 'inf-1',
      };

      jest
        .spyOn(prisma.influencer, 'findUnique')
        .mockResolvedValue(mockInfluencer as any);
      jest.spyOn(prisma.payout, 'create').mockResolvedValue(mockPayout as any);

      const result = await service.createPayout(dto);

      expect(result).toEqual(mockPayout);
      expect(prisma.payout.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if influencer not found', async () => {
      const dto = {
        type: PayoutType.INFLUENCER_COMMISSION,
        amount: 500,
        influencerId: 'invalid-id',
      };

      jest.spyOn(prisma.influencer, 'findUnique').mockResolvedValue(null);

      await expect(service.createPayout(dto)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw NotFoundException if campaign not found', async () => {
      const dto = {
        type: PayoutType.CAMPAIGN_PAYMENT,
        amount: 500,
        campaignId: 'invalid-id',
      };

      jest.spyOn(prisma.campaign, 'findUnique').mockResolvedValue(null);

      await expect(service.createPayout(dto)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should initialize status history', async () => {
      const dto = {
        type: PayoutType.INFLUENCER_COMMISSION,
        amount: 500,
        influencerId: 'inf-1',
      };

      jest
        .spyOn(prisma.influencer, 'findUnique')
        .mockResolvedValue(mockInfluencer as any);
      jest.spyOn(prisma.payout, 'create').mockResolvedValue(mockPayout as any);

      await service.createPayout(dto);

      const createCall = jest.spyOn(prisma.payout, 'create').mock.calls[0][0];
      expect(createCall.data.statusHistory).toBeDefined();
      expect((createCall.data.statusHistory as any)[0].status).toBe(
        PaymentStatus.PENDING
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated payouts', async () => {
      jest
        .spyOn(prisma.payout, 'findMany')
        .mockResolvedValue([mockPayout] as any);
      jest.spyOn(prisma.payout, 'count').mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual([mockPayout]);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter by status', async () => {
      jest
        .spyOn(prisma.payout, 'findMany')
        .mockResolvedValue([mockPayout] as any);
      jest.spyOn(prisma.payout, 'count').mockResolvedValue(1);

      await service.findAll({ status: PaymentStatus.PENDING });

      expect(prisma.payout.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: PaymentStatus.PENDING }),
        })
      );
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status and add to history', async () => {
      jest
        .spyOn(prisma.payout, 'findUnique')
        .mockResolvedValue(mockPayout as any);
      jest.spyOn(prisma.payout, 'update').mockResolvedValue({
        ...mockPayout,
        status: PaymentStatus.APPROVED,
      } as any);

      const result = await service.updatePaymentStatus(
        'payout-1',
        PaymentStatus.APPROVED,
        'Approved by admin'
      );

      expect(prisma.payout.update).toHaveBeenCalled();
    });
  });

  describe('linkDocuments', () => {
    it('should link two documents', async () => {
      const dto = {
        primaryDocumentId: 'po-1',
        primaryDocumentType: 'PO',
        linkedDocumentId: 'inv-1',
        linkedDocumentType: 'INVOICE',
        relationship: 'invoice_for_po',
      };

      jest.spyOn(prisma.documentLink, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.documentLink, 'create').mockResolvedValue({
        id: 'link-1',
        ...dto,
        createdAt: new Date(),
      } as any);

      const result = await service.linkDocuments(dto);

      expect(result).toBeDefined();
      expect(prisma.documentLink.create).toHaveBeenCalled();
    });

    it('should throw error if document type is invalid', async () => {
      const dto = {
        primaryDocumentId: 'po-1',
        primaryDocumentType: 'INVALID',
        linkedDocumentId: 'inv-1',
        linkedDocumentType: 'INVOICE',
        relationship: 'invoice_for_po',
      };

      await expect(service.linkDocuments(dto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw error if link already exists', async () => {
      const dto = {
        primaryDocumentId: 'po-1',
        primaryDocumentType: 'PO',
        linkedDocumentId: 'inv-1',
        linkedDocumentType: 'INVOICE',
        relationship: 'invoice_for_po',
      };

      jest
        .spyOn(prisma.documentLink, 'findUnique')
        .mockResolvedValue({ id: 'link-1' } as any);

      await expect(service.linkDocuments(dto)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('getPaymentTimeline', () => {
    it('should return payment timeline', async () => {
      const payoutWithTimeline = {
        ...mockPayout,
        approvedAt: new Date('2024-01-02'),
        paidAt: new Date('2024-01-03'),
      };

      jest
        .spyOn(prisma.payout, 'findUnique')
        .mockResolvedValue(payoutWithTimeline as any);

      const result = await service.getPaymentTimeline('payout-1');

      expect(result.payoutId).toBe('payout-1');
      expect(result.timeline.requested).toBeDefined();
    });
  });

  describe('getAuditTrail', () => {
    it('should return audit trail sorted by timestamp', async () => {
      const payoutWithHistory = {
        ...mockPayout,
        statusHistory: [
          { status: PaymentStatus.PENDING, timestamp: '2024-01-01T00:00:00Z' },
          { status: PaymentStatus.APPROVED, timestamp: '2024-01-02T00:00:00Z' },
        ],
      };

      jest
        .spyOn(prisma.payout, 'findUnique')
        .mockResolvedValue(payoutWithHistory as any);

      const result = await service.getAuditTrail('payout-1');

      expect(result.auditTrail).toHaveLength(2);
      expect(result.auditTrail[0].status).toBe(PaymentStatus.PENDING);
      expect(result.auditTrail[1].status).toBe(PaymentStatus.APPROVED);
    });
  });
});
