import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourierShipmentDto } from './dto/create-courier-shipment.dto';
import { UpdateCourierShipmentDto } from './dto/update-courier-shipment.dto';
import { CourierFilterDto } from './dto/courier-filter.dto';
import { ShipmentTimelineEventDto } from './dto/shipment-timeline-event.dto';
import { CourierStatus } from '@prisma/client';

@Injectable()
export class CourierShipmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCourierShipmentDto: CreateCourierShipmentDto) {
    // Check if tracking number already exists
    const existing = await this.prisma.courierShipment.findUnique({
      where: { trackingNumber: createCourierShipmentDto.trackingNumber },
    });

    if (existing) {
      throw new BadRequestException(
        `Tracking number ${createCourierShipmentDto.trackingNumber} already exists`
      );
    }

    // Validate send store if provided
    if (createCourierShipmentDto.sendStoreId) {
      const sendStore = await this.prisma.store.findUnique({
        where: { id: createCourierShipmentDto.sendStoreId },
      });
      if (!sendStore) {
        throw new NotFoundException(
          `Send store with ID ${createCourierShipmentDto.sendStoreId} not found`
        );
      }
    }

    // Validate return store if provided
    if (createCourierShipmentDto.returnStoreId) {
      const returnStore = await this.prisma.store.findUnique({
        where: { id: createCourierShipmentDto.returnStoreId },
      });
      if (!returnStore) {
        throw new NotFoundException(
          `Return store with ID ${createCourierShipmentDto.returnStoreId} not found`
        );
      }
    }

    // Validate influencer if provided
    if (createCourierShipmentDto.influencerId) {
      const influencer = await this.prisma.influencer.findUnique({
        where: { id: createCourierShipmentDto.influencerId },
      });
      if (!influencer) {
        throw new NotFoundException(
          `Influencer with ID ${createCourierShipmentDto.influencerId} not found`
        );
      }
    }

    // Validate campaign if provided
    if (createCourierShipmentDto.campaignId) {
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: createCourierShipmentDto.campaignId },
      });
      if (!campaign) {
        throw new NotFoundException(
          `Campaign with ID ${createCourierShipmentDto.campaignId} not found`
        );
      }
    }

    // Create shipment with initial timeline
    return this.prisma.courierShipment.create({
      data: {
        trackingNumber: createCourierShipmentDto.trackingNumber,
        courierName: createCourierShipmentDto.courierName,
        courierCompany: createCourierShipmentDto.courierCompany,
        status: createCourierShipmentDto.status || CourierStatus.PENDING,
        sendStoreId: createCourierShipmentDto.sendStoreId,
        returnStoreId: createCourierShipmentDto.returnStoreId,
        influencerId: createCourierShipmentDto.influencerId,
        campaignId: createCourierShipmentDto.campaignId,
        statusTimeline: {
          events: [
            {
              status: createCourierShipmentDto.status || CourierStatus.PENDING,
              timestamp: new Date().toISOString(),
              notes: 'Shipment created',
            },
          ],
        },
      },
      include: {
        sendStore: true,
        returnStore: true,
        influencer: true,
        campaign: true,
      },
    });
  }

  async findAll(filterDto: CourierFilterDto = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      campaignId,
      influencerId,
      sendStoreId,
      returnStoreId,
      trackingNumber,
      courierName,
      dateFrom,
      dateTo,
    } = filterDto;

    const where = {
      ...(status && { status }),
      ...(campaignId && { campaignId }),
      ...(influencerId && { influencerId }),
      ...(sendStoreId && { sendStoreId }),
      ...(returnStoreId && { returnStoreId }),
      ...(trackingNumber && {
        trackingNumber: {
          contains: trackingNumber,
          mode: 'insensitive' as const,
        },
      }),
      ...(courierName && {
        courierName: { contains: courierName, mode: 'insensitive' as const },
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

    const [shipments, total] = await Promise.all([
      this.prisma.courierShipment.findMany({
        where,
        include: {
          sendStore: true,
          returnStore: true,
          influencer: true,
          campaign: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.courierShipment.count({ where }),
    ]);

    return {
      data: shipments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const shipment = await this.prisma.courierShipment.findUnique({
      where: { id },
      include: {
        sendStore: true,
        returnStore: true,
        influencer: true,
        campaign: true,
      },
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }

    return shipment;
  }

  async update(id: string, updateCourierShipmentDto: UpdateCourierShipmentDto) {
    const shipment = await this.findOne(id);

    // Validate tracking number uniqueness if updating
    if (
      updateCourierShipmentDto.trackingNumber &&
      updateCourierShipmentDto.trackingNumber !== shipment.trackingNumber
    ) {
      const existing = await this.prisma.courierShipment.findUnique({
        where: { trackingNumber: updateCourierShipmentDto.trackingNumber },
      });
      if (existing) {
        throw new BadRequestException(
          `Tracking number ${updateCourierShipmentDto.trackingNumber} already exists`
        );
      }
    }

    // Validate stores if provided
    if (updateCourierShipmentDto.sendStoreId) {
      const sendStore = await this.prisma.store.findUnique({
        where: { id: updateCourierShipmentDto.sendStoreId },
      });
      if (!sendStore) {
        throw new NotFoundException(
          `Send store with ID ${updateCourierShipmentDto.sendStoreId} not found`
        );
      }
    }

    if (updateCourierShipmentDto.returnStoreId) {
      const returnStore = await this.prisma.store.findUnique({
        where: { id: updateCourierShipmentDto.returnStoreId },
      });
      if (!returnStore) {
        throw new NotFoundException(
          `Return store with ID ${updateCourierShipmentDto.returnStoreId} not found`
        );
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = { ...updateCourierShipmentDto };

    // Remove status from updateData as it will be handled separately
    delete updateData.status;

    return this.prisma.courierShipment.update({
      where: { id },
      data: updateData,
      include: {
        sendStore: true,
        returnStore: true,
        influencer: true,
        campaign: true,
      },
    });
  }

  async updateStatus(id: string, status: CourierStatus) {
    const shipment = await this.findOne(id);
    this.validateStatusTransition(shipment.status, status);

    // Add event to timeline
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const timeline = (shipment.statusTimeline as any) || { events: [] };
    if (!Array.isArray(timeline.events)) {
      timeline.events = [];
    }

    timeline.events.push({
      status,
      timestamp: new Date().toISOString(),
      notes: `Status updated to ${status}`,
    });

    return this.prisma.courierShipment.update({
      where: { id },
      data: {
        status,
        statusTimeline: timeline,
      },
      include: {
        sendStore: true,
        returnStore: true,
        influencer: true,
        campaign: true,
      },
    });
  }

  async addTimelineEvent(id: string, eventDto: ShipmentTimelineEventDto) {
    const shipment = await this.findOne(id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const timeline = (shipment.statusTimeline as any) || { events: [] };
    if (!Array.isArray(timeline.events)) {
      timeline.events = [];
    }

    timeline.events.push({
      status: eventDto.status,
      timestamp: eventDto.timestamp || new Date().toISOString(),
      notes: eventDto.notes,
      location: eventDto.location,
      userId: eventDto.userId,
    });

    // Update status if it's different
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {
      statusTimeline: timeline,
    };

    if (eventDto.status !== shipment.status) {
      this.validateStatusTransition(shipment.status, eventDto.status);
      updateData.status = eventDto.status;
    }

    return this.prisma.courierShipment.update({
      where: { id },
      data: updateData,
      include: {
        sendStore: true,
        returnStore: true,
        influencer: true,
        campaign: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.courierShipment.delete({
      where: { id },
    });
  }

  async getShipmentsByStatus(status: CourierStatus) {
    return this.prisma.courierShipment.findMany({
      where: { status },
      include: {
        sendStore: true,
        returnStore: true,
        influencer: true,
        campaign: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getShipmentsByCampaign(campaignId: string) {
    return this.prisma.courierShipment.findMany({
      where: { campaignId },
      include: {
        sendStore: true,
        returnStore: true,
        influencer: true,
        campaign: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getOutstandingReturns() {
    return this.prisma.courierShipment.findMany({
      where: {
        status: CourierStatus.RETURNED,
        returnedDate: null,
      },
      include: {
        sendStore: true,
        returnStore: true,
        influencer: true,
        campaign: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getAggregateStats() {
    const [totalShipments, byStatus, outstandingReturns] = await Promise.all([
      this.prisma.courierShipment.count(),
      this.prisma.courierShipment.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.courierShipment.count({
        where: {
          status: CourierStatus.RETURNED,
          returnedDate: null,
        },
      }),
    ]);

    const statusCounts = byStatus.reduce(
      (acc, item) => {
        acc[item.status] = item._count;
        return acc;
      },
      {} as Record<CourierStatus, number>
    );

    return {
      totalShipments,
      byStatus: statusCounts,
      outstandingReturns,
    };
  }

  private validateStatusTransition(
    currentStatus: CourierStatus,
    newStatus: CourierStatus
  ): void {
    const validTransitions: Record<CourierStatus, CourierStatus[]> = {
      [CourierStatus.PENDING]: [CourierStatus.SENT, CourierStatus.FAILED],
      [CourierStatus.SENT]: [
        CourierStatus.IN_TRANSIT,
        CourierStatus.FAILED,
        CourierStatus.DELIVERED,
      ],
      [CourierStatus.IN_TRANSIT]: [
        CourierStatus.DELIVERED,
        CourierStatus.RETURNED,
        CourierStatus.FAILED,
      ],
      [CourierStatus.DELIVERED]: [CourierStatus.RETURNED],
      [CourierStatus.RETURNED]: [],
      [CourierStatus.FAILED]: [CourierStatus.PENDING],
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`
      );
    }
  }
}
