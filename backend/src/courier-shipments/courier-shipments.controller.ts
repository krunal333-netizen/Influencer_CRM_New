import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Query,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { CourierShipmentsService } from './courier-shipments.service';
import { CreateCourierShipmentDto } from './dto/create-courier-shipment.dto';
import { UpdateCourierShipmentDto } from './dto/update-courier-shipment.dto';
import { CourierFilterDto } from './dto/courier-filter.dto';
import { ShipmentTimelineEventDto } from './dto/shipment-timeline-event.dto';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import { CourierStatus } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('courier-shipments')
@Controller('courier-shipments')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
export class CourierShipmentsController {
  constructor(
    private readonly courierShipmentsService: CourierShipmentsService
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create new courier shipment',
    description: 'Create a new courier shipment with initial timeline entry',
  })
  create(@Body() createCourierShipmentDto: CreateCourierShipmentDto) {
    return this.courierShipmentsService.create(createCourierShipmentDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all shipments with filtering',
    description:
      'Retrieve all courier shipments with optional filters by status, campaign, influencer, dates, etc.',
  })
  findAll(@Query() filterDto: CourierFilterDto) {
    return this.courierShipmentsService.findAll(filterDto);
  }

  @Get('by-status/:status')
  @ApiOperation({
    summary: 'Get shipments by status',
    description: 'Retrieve all shipments with a specific status',
  })
  async getByStatus(@Param('status') status: string) {
    if (!Object.values(CourierStatus).includes(status as CourierStatus)) {
      throw new BadRequestException('Invalid courier status');
    }
    return this.courierShipmentsService.getShipmentsByStatus(
      status as CourierStatus
    );
  }

  @Get('by-campaign/:campaignId')
  @ApiOperation({
    summary: 'Get shipments by campaign',
    description: 'Retrieve all shipments linked to a specific campaign',
  })
  async getByCampaign(@Param('campaignId') campaignId: string) {
    return this.courierShipmentsService.getShipmentsByCampaign(campaignId);
  }

  @Get('stats/outstanding-returns')
  @ApiOperation({
    summary: 'Get outstanding returns',
    description:
      'Retrieve all shipments marked as returned but not yet processed',
  })
  async getOutstandingReturns() {
    return this.courierShipmentsService.getOutstandingReturns();
  }

  @Get('stats/aggregate')
  @ApiOperation({
    summary: 'Get aggregate statistics',
    description:
      'Get statistics on shipment distribution by status and outstanding items',
  })
  async getAggregateStats() {
    return this.courierShipmentsService.getAggregateStats();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get shipment details',
    description: 'Retrieve detailed information for a specific shipment',
  })
  findOne(@Param('id') id: string) {
    return this.courierShipmentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update shipment details',
    description:
      'Update shipment information (tracking, dates, linked entities)',
  })
  update(
    @Param('id') id: string,
    @Body() updateCourierShipmentDto: UpdateCourierShipmentDto
  ) {
    return this.courierShipmentsService.update(id, updateCourierShipmentDto);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update shipment status',
    description:
      'Update the status of a shipment with automatic timeline tracking',
  })
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    if (!Object.values(CourierStatus).includes(status as CourierStatus)) {
      throw new BadRequestException('Invalid courier status');
    }
    return this.courierShipmentsService.updateStatus(
      id,
      status as CourierStatus
    );
  }

  @Post(':id/timeline-event')
  @ApiOperation({
    summary: 'Add timeline event',
    description:
      'Record a shipment status change with optional notes, location, and user',
  })
  async addTimelineEvent(
    @Param('id') id: string,
    @Body() eventDto: ShipmentTimelineEventDto
  ) {
    return this.courierShipmentsService.addTimelineEvent(id, eventDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete shipment',
    description: 'Delete a courier shipment record',
  })
  remove(@Param('id') id: string) {
    return this.courierShipmentsService.remove(id);
  }
}
