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
  UseInterceptors,
  UploadedFile,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceFilterDto } from './dto/invoice-filter.dto';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import { InvoiceImageStatus } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('invoices')
@Controller('invoices')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload and process invoice image',
    description:
      'Upload an invoice image which will be stored and processed by OCR to extract fields',
  })
  async uploadInvoice(
    @UploadedFile() file: Express.Multer.File,
    @Body() createInvoiceDto: CreateInvoiceDto
  ) {
    return this.invoicesService.create(createInvoiceDto, file);
  }

  @Get()
  @ApiOperation({
    summary: 'List all invoices with filtering',
    description:
      'Retrieve all invoices with optional filters by status, campaign, date range',
  })
  findAll(@Query() filterDto: InvoiceFilterDto) {
    return this.invoicesService.findAll(filterDto);
  }

  @Get('by-status/:status')
  @ApiOperation({
    summary: 'Get invoices by status',
    description: 'Retrieve all invoices with a specific status',
  })
  async getByStatus(@Param('status') status: string) {
    if (
      !Object.values(InvoiceImageStatus).includes(status as InvoiceImageStatus)
    ) {
      throw new BadRequestException('Invalid status');
    }
    return this.invoicesService.getInvoicesByStatus(
      status as InvoiceImageStatus
    );
  }

  @Get('by-campaign/:campaignId')
  @ApiOperation({
    summary: 'Get invoices by campaign',
    description: 'Retrieve all invoices linked to a specific campaign',
  })
  async getByCampaign(@Param('campaignId') campaignId: string) {
    return this.invoicesService.getInvoicesByCampaign(campaignId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get invoice details',
    description: 'Retrieve detailed information for a specific invoice',
  })
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update invoice details',
    description: 'Update OCR data, status, and links for an invoice',
  })
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoicesService.update(id, updateInvoiceDto);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update invoice status',
    description: 'Update the processing status of an invoice',
  })
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    if (
      !Object.values(InvoiceImageStatus).includes(status as InvoiceImageStatus)
    ) {
      throw new BadRequestException('Invalid status');
    }
    return this.invoicesService.updateStatus(id, status as InvoiceImageStatus);
  }

  @Post(':id/link-campaign')
  @ApiOperation({
    summary: 'Link invoice to campaign',
    description: 'Associate an invoice with a campaign',
  })
  async linkCampaign(
    @Param('id') id: string,
    @Body('campaignId') campaignId: string
  ) {
    return this.invoicesService.linkToCampaign(id, campaignId);
  }

  @Post(':id/link-product')
  @ApiOperation({
    summary: 'Link invoice to product',
    description: 'Associate an invoice with a product',
  })
  async linkProduct(
    @Param('id') id: string,
    @Body('productId') productId: string
  ) {
    return this.invoicesService.linkToProduct(id, productId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete invoice',
    description: 'Delete an invoice and its associated image file',
  })
  remove(@Param('id') id: string) {
    return this.invoicesService.remove(id);
  }
}
