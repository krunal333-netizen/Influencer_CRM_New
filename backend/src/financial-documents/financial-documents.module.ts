import { Module } from '@nestjs/common';
import { FinancialDocumentsController } from './financial-documents.controller';
import { FinancialDocumentsService } from './financial-documents.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FinancialDocumentsController],
  providers: [FinancialDocumentsService],
  exports: [FinancialDocumentsService],
})
export class FinancialDocumentsModule {}
