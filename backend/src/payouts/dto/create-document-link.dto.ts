import { IsString, IsOptional } from 'class-validator';

export class CreateDocumentLinkDto {
  @IsString()
  primaryDocumentId: string;

  @IsString()
  primaryDocumentType: string; // "INVOICE" | "PO" | "PAYOUT"

  @IsString()
  linkedDocumentId: string;

  @IsString()
  linkedDocumentType: string; // "INVOICE" | "PO" | "PAYOUT"

  @IsString()
  relationship: string; // e.g., "invoice_for_po", "payout_for_invoice"

  @IsOptional()
  @IsString()
  notes?: string;
}
