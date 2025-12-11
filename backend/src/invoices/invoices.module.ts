import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { InvoiceOcrService } from './ocr.service';

@Module({
  imports: [],
  controllers: [InvoicesController],
  providers: [InvoicesService, InvoiceOcrService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
