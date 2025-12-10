import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

describe('CampaignsService', () => {
  let service: CampaignsService;
  let prismaService: any;

  const mockCampaign = {
    id: 'campaign-1',
    name: 'Test Campaign',
    description: 'A test campaign',
    status: 'DRAFT',
    type: 'MIXED',
    budget: 1000,
    budgetSpent: 0,
    budgetAllocated: 500,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    deliverableDeadline: new Date('2024-01-28'),
    brief: 'Test brief',
    reelsRequired: 5,
    postsRequired: 10,
    storiesRequired: 15,
    storeId: 'store-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    store: {
      id: 'store-1',
      name: 'Test Store',
      email: 'store@example.com',
      phone: null,
      address: null,
      city: null,
      state: null,
      zipCode: null,
      country: null,
      firmId: 'firm-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    products: [],
    influencerLinks: [],
    financialDocuments: [],
    invoiceImages: [],
    courierShipments: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignsService,
        {
          provide: PrismaService,
          useValue: {
            campaign: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CampaignsService>(CampaignsService);
    prismaService = module.get(PrismaService);
  });

  describe('create', () => {
    it('should create a campaign with dates converted to Date objects', async () => {
      const createDto: CreateCampaignDto = {
        name: 'Test Campaign',
        storeId: 'store-1',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        deliverableDeadline: '2024-01-28',
      };

      const expectedStartDate = new Date('2024-01-01');
      const expectedEndDate = new Date('2024-01-31');
      const expectedDeadline = new Date('2024-01-28');

      prismaService.campaign.create.mockResolvedValue(mockCampaign);

      const result = await service.create(createDto);

      expect(prismaService.campaign.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Test Campaign',
            storeId: 'store-1',
            startDate: expectedStartDate,
            endDate: expectedEndDate,
            deliverableDeadline: expectedDeadline,
          }),
        })
      );
      expect(result).toEqual(mockCampaign);
    });

    it('should handle null dates', async () => {
      const createDto: CreateCampaignDto = {
        name: 'Test Campaign',
        storeId: 'store-1',
      };

      prismaService.campaign.create.mockResolvedValue(mockCampaign);

      await service.create(createDto);

      expect(prismaService.campaign.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            startDate: null,
            endDate: null,
            deliverableDeadline: null,
          }),
        })
      );
    });
  });

  describe('findAll', () => {
    it('should return campaigns with pagination and metadata', async () => {
      const filterDto = { page: 1, limit: 10 };
      const mockPaginatedResult = {
        data: [mockCampaign],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          pages: 1,
        },
      };

      prismaService.campaign.findMany.mockResolvedValue([mockCampaign]);
      prismaService.campaign.count.mockResolvedValue(1);

      const result = await service.findAll(filterDto);

      expect(result.data).toEqual([mockCampaign]);
      expect(result.pagination).toEqual(mockPaginatedResult.pagination);
    });

    it('should filter campaigns by status', async () => {
      const filterDto = { status: 'ACTIVE', page: 1, limit: 10 };

      prismaService.campaign.findMany.mockResolvedValue([mockCampaign]);
      prismaService.campaign.count.mockResolvedValue(1);

      await service.findAll(filterDto);

      expect(prismaService.campaign.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'ACTIVE' }),
        })
      );
    });

    it('should filter campaigns by type', async () => {
      const filterDto: any = { type: 'REELS', page: 1, limit: 10 };

      prismaService.campaign.findMany.mockResolvedValue([mockCampaign]);
      prismaService.campaign.count.mockResolvedValue(1);

      await service.findAll(filterDto);

      expect(prismaService.campaign.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'REELS' }),
        })
      );
    });

    it('should filter campaigns by storeId', async () => {
      const filterDto = { storeId: 'store-1', page: 1, limit: 10 };

      prismaService.campaign.findMany.mockResolvedValue([mockCampaign]);
      prismaService.campaign.count.mockResolvedValue(1);

      await service.findAll(filterDto);

      expect(prismaService.campaign.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ storeId: 'store-1' }),
        })
      );
    });

    it('should search campaigns by name and description', async () => {
      const filterDto = { search: 'test', page: 1, limit: 10 };

      prismaService.campaign.findMany.mockResolvedValue([mockCampaign]);
      prismaService.campaign.count.mockResolvedValue(1);

      await service.findAll(filterDto);

      expect(prismaService.campaign.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ name: expect.any(Object) }),
              expect.objectContaining({ description: expect.any(Object) }),
            ]),
          }),
        })
      );
    });

    it('should apply pagination correctly', async () => {
      const filterDto = { page: 2, limit: 5 };

      prismaService.campaign.findMany.mockResolvedValue([mockCampaign]);
      prismaService.campaign.count.mockResolvedValue(15);

      const result = await service.findAll(filterDto);

      expect(prismaService.campaign.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        })
      );
      expect(result.pagination).toEqual({
        total: 15,
        page: 2,
        limit: 5,
        pages: 3,
      });
    });
  });

  describe('findOne', () => {
    it('should return a campaign by id', async () => {
      prismaService.campaign.findUnique.mockResolvedValue(mockCampaign);

      const result = await service.findOne('campaign-1');

      expect(result).toEqual(mockCampaign);
      expect(prismaService.campaign.findUnique).toHaveBeenCalledWith({
        where: { id: 'campaign-1' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when campaign not found', async () => {
      prismaService.campaign.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('update', () => {
    it('should update a campaign', async () => {
      const updateDto: UpdateCampaignDto = {
        name: 'Updated Campaign',
      };

      prismaService.campaign.findUnique.mockResolvedValue(mockCampaign);
      prismaService.campaign.update.mockResolvedValue({
        ...mockCampaign,
        name: 'Updated Campaign',
      });

      const result = await service.update('campaign-1', updateDto);

      expect(prismaService.campaign.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'campaign-1' },
        })
      );
      expect(result.name).toBe('Updated Campaign');
    });

    it('should throw NotFoundException when campaign to update does not exist', async () => {
      prismaService.campaign.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', {})).rejects.toThrow(
        NotFoundException
      );
    });

    it('should handle date conversion in update', async () => {
      const updateDto: UpdateCampaignDto = {
        startDate: '2024-02-01',
        endDate: '2024-02-28',
      };

      prismaService.campaign.findUnique.mockResolvedValue(mockCampaign);
      prismaService.campaign.update.mockResolvedValue(mockCampaign);

      await service.update('campaign-1', updateDto);

      expect(prismaService.campaign.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            startDate: new Date('2024-02-01'),
            endDate: new Date('2024-02-28'),
          }),
        })
      );
    });
  });

  describe('remove', () => {
    it('should delete a campaign', async () => {
      prismaService.campaign.findUnique.mockResolvedValue(mockCampaign);
      prismaService.campaign.delete.mockResolvedValue(mockCampaign);

      const result = await service.remove('campaign-1');

      expect(prismaService.campaign.delete).toHaveBeenCalledWith({
        where: { id: 'campaign-1' },
      });
      expect(result).toEqual(mockCampaign);
    });

    it('should throw NotFoundException when campaign to delete does not exist', async () => {
      prismaService.campaign.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('updateStatus', () => {
    it('should update campaign status', async () => {
      prismaService.campaign.findUnique.mockResolvedValue(mockCampaign);
      prismaService.campaign.update.mockResolvedValue({
        ...mockCampaign,
        status: 'ACTIVE',
      });

      const result = await service.updateStatus('campaign-1', 'ACTIVE');

      expect(prismaService.campaign.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'ACTIVE' },
        })
      );
      expect(result.status).toBe('ACTIVE');
    });

    it('should throw NotFoundException when campaign does not exist', async () => {
      prismaService.campaign.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus('non-existent', 'ACTIVE')
      ).rejects.toThrow(NotFoundException);
    });
  });
});
