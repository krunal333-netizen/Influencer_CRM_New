import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PayoutsService } from './payouts.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { UpdatePayoutDto } from './dto/update-payout.dto';
import { PayoutFilterDto } from './dto/payout-filter.dto';
import { CreateDocumentLinkDto } from './dto/create-document-link.dto';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import { PaymentStatus } from '@prisma/client';

@ApiTags('payouts')
@Controller('payouts')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create payout',
    description:
      'Create a new payout for influencer commission or campaign payment',
  })
  async createPayout(@Body() dto: CreatePayoutDto) {
    return this.payoutsService.createPayout(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List payouts',
    description:
      'Retrieve payouts with optional filters by status, type, date range',
  })
  async listPayouts(@Query() filterDto: PayoutFilterDto) {
    return this.payoutsService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get payout details',
    description: 'Retrieve details of a specific payout',
  })
  async getPayout(@Param('id') id: string) {
    return this.payoutsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update payout',
    description: 'Update payout amount, status, or notes',
  })
  async updatePayout(@Param('id') id: string, @Body() dto: UpdatePayoutDto) {
    return this.payoutsService.updatePayout(id, dto);
  }

  @Put(':id/status')
  @ApiOperation({
    summary: 'Update payment status',
    description: 'Update the payment status and record status change',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: PaymentStatus; notes?: string }
  ) {
    return this.payoutsService.updatePaymentStatus(id, body.status, body.notes);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete payout',
    description: 'Delete a payout',
  })
  async deletePayout(@Param('id') id: string) {
    return this.payoutsService.removePayout(id);
  }

  @Get(':id/timeline')
  @ApiOperation({
    summary: 'Get payment timeline',
    description: 'View the payment status timeline for a payout',
  })
  async getTimeline(@Param('id') id: string) {
    return this.payoutsService.getPaymentTimeline(id);
  }

  @Get(':id/audit-trail')
  @ApiOperation({
    summary: 'Get audit trail',
    description:
      'View the complete audit trail and status history for a payout',
  })
  async getAuditTrail(@Param('id') id: string) {
    return this.payoutsService.getAuditTrail(id);
  }

  @Get('by-influencer/:influencerId')
  @ApiOperation({
    summary: 'Get payouts by influencer',
    description:
      'Retrieve all payouts for a specific influencer with summary stats',
  })
  async getInfluencerPayouts(@Param('influencerId') influencerId: string) {
    return this.payoutsService.getPayoutsByInfluencer(influencerId);
  }

  @Get('by-campaign/:campaignId')
  @ApiOperation({
    summary: 'Get payouts by campaign',
    description: 'Retrieve all payouts for a specific campaign',
  })
  async getCampaignPayouts(@Param('campaignId') campaignId: string) {
    return this.payoutsService.getPayoutsByCampaign(campaignId);
  }

  @Post('link-documents')
  @ApiOperation({
    summary: 'Link documents',
    description: 'Link Invoice ↔ PO ↔ Payout documents together',
  })
  async linkDocuments(@Body() dto: CreateDocumentLinkDto) {
    return this.payoutsService.linkDocuments(dto);
  }

  @Get('document-links/:documentId')
  @ApiOperation({
    summary: 'Get document links',
    description: 'Retrieve all documents linked to a specific document',
  })
  async getDocumentLinks(@Param('documentId') documentId: string) {
    return this.payoutsService.getDocumentLinks(documentId);
  }

  @Delete('document-links/:linkId')
  @ApiOperation({
    summary: 'Remove document link',
    description: 'Remove the link between two documents',
  })
  async removeDocumentLink(@Param('linkId') linkId: string) {
    return this.payoutsService.removeDocumentLink(linkId);
  }
}
