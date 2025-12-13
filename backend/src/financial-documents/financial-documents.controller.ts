import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import { FinancialDocumentsService } from './financial-documents.service';
import { CreateFinancialDocumentDto } from './dto/create-financial-document.dto';
import { UpdateFinancialDocumentDto } from './dto/update-financial-document.dto';
import { FinancialDocumentFilterDto } from './dto/financial-document-filter.dto';

@ApiTags('financial-documents')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('financial-documents')
export class FinancialDocumentsController {
  constructor(private readonly financialDocumentsService: FinancialDocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new financial document' })
  create(@Body() createDto: CreateFinancialDocumentDto) {
    return this.financialDocumentsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all financial documents with filtering' })
  findAll(@Query() filterDto: FinancialDocumentFilterDto) {
    return this.financialDocumentsService.findAll(filterDto);
  }

  @Get('stats/by-type')
  @ApiOperation({ summary: 'Get financial document statistics by type' })
  getStatsByType() {
    return this.financialDocumentsService.getStatsByType();
  }

  @Get('stats/by-firm')
  @ApiOperation({ summary: 'Get financial document statistics by firm' })
  getStatsByFirm() {
    return this.financialDocumentsService.getStatsByFirm();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific financial document' })
  findOne(@Param('id') id: string) {
    return this.financialDocumentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a financial document' })
  update(@Param('id') id: string, @Body() updateDto: UpdateFinancialDocumentDto) {
    return this.financialDocumentsService.update(id, updateDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update financial document status' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.financialDocumentsService.updateStatus(id, status);
  }

  @Patch(':id/mark-paid')
  @ApiOperation({ summary: 'Mark financial document as paid' })
  markAsPaid(@Param('id') id: string, @Body('paidDate') paidDate?: string) {
    return this.financialDocumentsService.markAsPaid(id, paidDate);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a financial document' })
  remove(@Param('id') id: string) {
    return this.financialDocumentsService.remove(id);
  }
}
