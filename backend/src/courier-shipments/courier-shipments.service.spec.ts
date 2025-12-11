import { Test, TestingModule } from '@nestjs/testing';
import { CourierShipmentsService } from './courier-shipments.service';
import { PrismaService } from '../prisma/prisma.service';
import { CourierStatus } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CourierShipmentsService', () => {
  let service: CourierShipmentsService;

  const mockPrismaService = {
    courierShipment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    store: {
      findUnique: jest.fn(),
    },
    influencer: {
      findUnique: jest.fn(),
    },
    campaign: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourierShipmentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CourierShipmentsService>(CourierShipmentsService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new shipment', async () => {
      const createDto = {
        trackingNumber: 'TRACK123',
        courierName: 'UPS',
        courierCompany: 'United Parcel Service',
        sendStoreId: 'store1',
        campaignId: 'camp1',
      };

      const mockShipment = {
        id: 'ship1',
        trackingNumber: 'TRACK123',
        courierName: 'UPS',
        courierCompany: 'United Parcel Service',
        status: CourierStatus.PENDING,
        sendStoreId: 'store1',
        returnStoreId: null,
        influencerId: null,
        campaignId: 'camp1',
        sentDate: null,
        receivedDate: null,
        returnedDate: null,
        statusTimeline: { events: [] },
        createdAt: new Date(),
        updatedAt: new Date(),
        sendStore: null,
        returnStore: null,
        influencer: null,
        campaign: null,
      };

      mockPrismaService.courierShipment.findUnique.mockResolvedValue(null);
      mockPrismaService.store.findUnique.mockResolvedValue({ id: 'store1' });
      mockPrismaService.campaign.findUnique.mockResolvedValue({ id: 'camp1' });
      mockPrismaService.courierShipment.create.mockResolvedValue(mockShipment);

      const result = await service.create(createDto);

      expect(result).toEqual(mockShipment);
      expect(mockPrismaService.courierShipment.create).toHaveBeenCalled();
    });

    it('should reject duplicate tracking number', async () => {
      const createDto = {
        trackingNumber: 'TRACK123',
        courierName: 'UPS',
        courierCompany: 'United Parcel Service',
      };

      mockPrismaService.courierShipment.findUnique.mockResolvedValue({
        id: 'ship1',
      });

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should validate send store exists', async () => {
      const createDto = {
        trackingNumber: 'TRACK123',
        courierName: 'UPS',
        courierCompany: 'United Parcel Service',
        sendStoreId: 'nonexistent',
      };

      mockPrismaService.courierShipment.findUnique.mockResolvedValue(null);
      mockPrismaService.store.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated shipments', async () => {
      const mockShipments = [
        {
          id: 'ship1',
          status: CourierStatus.PENDING,
          trackingNumber: 'TRACK123',
        },
      ];

      mockPrismaService.courierShipment.findMany.mockResolvedValue(
        mockShipments
      );
      mockPrismaService.courierShipment.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(mockShipments);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter shipments by status', async () => {
      mockPrismaService.courierShipment.findMany.mockResolvedValue([]);
      mockPrismaService.courierShipment.count.mockResolvedValue(0);

      await service.findAll({ status: CourierStatus.IN_TRANSIT });

      expect(mockPrismaService.courierShipment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: CourierStatus.IN_TRANSIT,
          }),
        })
      );
    });
  });

  describe('findOne', () => {
    it('should return a shipment by id', async () => {
      const mockShipment = { id: 'ship1', status: CourierStatus.PENDING };
      mockPrismaService.courierShipment.findUnique.mockResolvedValue(
        mockShipment
      );

      const result = await service.findOne('ship1');

      expect(result).toEqual(mockShipment);
    });

    it('should throw NotFoundException if shipment not found', async () => {
      mockPrismaService.courierShipment.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('updateStatus', () => {
    it('should update status with valid transition', async () => {
      const mockShipment = {
        id: 'ship1',
        status: CourierStatus.PENDING,
        statusTimeline: { events: [] },
      };

      mockPrismaService.courierShipment.findUnique.mockResolvedValue(
        mockShipment
      );
      mockPrismaService.courierShipment.update.mockResolvedValue({
        ...mockShipment,
        status: CourierStatus.SENT,
      });

      const result = await service.updateStatus('ship1', CourierStatus.SENT);

      expect(result.status).toBe(CourierStatus.SENT);
    });

    it('should reject invalid status transition', async () => {
      const mockShipment = {
        id: 'ship1',
        status: CourierStatus.DELIVERED,
      };

      mockPrismaService.courierShipment.findUnique.mockResolvedValue(
        mockShipment
      );

      // DELIVERED can only transition to RETURNED
      await expect(
        service.updateStatus('ship1', CourierStatus.SENT)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('addTimelineEvent', () => {
    it('should add timeline event', async () => {
      const mockShipment = {
        id: 'ship1',
        status: CourierStatus.SENT,
        statusTimeline: { events: [] },
      };

      const eventDto = {
        status: CourierStatus.IN_TRANSIT,
        timestamp: new Date().toISOString(),
        notes: 'Package in transit',
        location: 'Hub 1',
      };

      mockPrismaService.courierShipment.findUnique.mockResolvedValue(
        mockShipment
      );
      mockPrismaService.courierShipment.update.mockResolvedValue({
        ...mockShipment,
        status: CourierStatus.IN_TRANSIT,
      });

      await service.addTimelineEvent('ship1', eventDto);

      expect(mockPrismaService.courierShipment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: CourierStatus.IN_TRANSIT,
          }),
        })
      );
    });
  });

  describe('getAggregateStats', () => {
    it('should return aggregate statistics', async () => {
      mockPrismaService.courierShipment.count.mockResolvedValue(10);
      mockPrismaService.courierShipment.groupBy.mockResolvedValue([
        { status: CourierStatus.PENDING, _count: 2 },
        { status: CourierStatus.SENT, _count: 3 },
        { status: CourierStatus.DELIVERED, _count: 5 },
      ]);

      const result = await service.getAggregateStats();

      expect(result.totalShipments).toBe(10);
      expect(result.byStatus[CourierStatus.SENT]).toBe(3);
    });
  });

  describe('remove', () => {
    it('should delete a shipment', async () => {
      const mockShipment = { id: 'ship1' };
      mockPrismaService.courierShipment.findUnique.mockResolvedValue(
        mockShipment
      );
      mockPrismaService.courierShipment.delete.mockResolvedValue(mockShipment);

      const result = await service.remove('ship1');

      expect(result).toEqual(mockShipment);
      expect(mockPrismaService.courierShipment.delete).toHaveBeenCalledWith({
        where: { id: 'ship1' },
      });
    });
  });
});
