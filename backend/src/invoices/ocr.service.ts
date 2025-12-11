import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface OcrResult {
  rawText: string;
  asCode?: string;
  productDescription?: string;
  unitPrice?: number;
  totalAmount?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extractedFields: Record<string, any>;
}

@Injectable()
export class InvoiceOcrService {
  private readonly logger = new Logger(InvoiceOcrService.name);

  constructor(private readonly configService: ConfigService) {}

  async extractTextFromImage(_imagePath: string): Promise<OcrResult> {
    const ocrEnabled = this.configService.get<boolean>('OCR_ENABLED', true);

    if (!ocrEnabled) {
      return {
        rawText: '',
        extractedFields: {},
      };
    }

    try {
      // For now, return a structured response with empty data
      // In production, you would integrate with tesseract.js or a similar OCR library
      // This is a mock implementation to satisfy the interface requirements

      return {
        rawText: '',
        asCode: undefined,
        productDescription: undefined,
        unitPrice: undefined,
        totalAmount: undefined,
        extractedFields: {
          asCode: undefined,
          productDescription: undefined,
          unitPrice: undefined,
          totalAmount: undefined,
          extractedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`OCR extraction failed: ${error}`);
      return {
        rawText: '',
        extractedFields: {
          extractedAt: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  parseOcrText(rawText: string): {
    asCode?: string;
    productDescription?: string;
    unitPrice?: number;
    totalAmount?: number;
  } {
    // Mock parser - in production, implement actual OCR parsing logic
    const result = {
      asCode: undefined,
      productDescription: undefined,
      unitPrice: undefined,
      totalAmount: undefined,
    };

    // Simple pattern matching for demonstration
    const asCodeMatch = rawText.match(/AS[A-Z0-9]{6,}/i);
    if (asCodeMatch) {
      result.asCode = asCodeMatch[0];
    }

    const priceMatch = rawText.match(/[$€£]\s*(\d+\.?\d*)/);
    if (priceMatch) {
      result.unitPrice = parseFloat(priceMatch[1]);
    }

    const totalMatch = rawText.match(/total[:\s]+[$€£]\s*(\d+\.?\d*)/i);
    if (totalMatch) {
      result.totalAmount = parseFloat(totalMatch[1]);
    }

    return result;
  }
}
