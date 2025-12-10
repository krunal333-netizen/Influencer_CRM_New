import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LinkProductDto } from './dto/link-product.dto';

@Injectable()
export class CampaignProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async linkProduct(campaignId: string, linkProductDto: LinkProductDto) {
    const { productId, dueDate, ...rest } = linkProductDto;

    // Verify campaign exists
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new BadRequestException(`Campaign with ID ${campaignId} not found`);
    }

    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new BadRequestException(`Product with ID ${productId} not found`);
    }

    // Upsert the campaign-product link
    return this.prisma.campaignProduct.upsert({
      where: {
        campaignId_productId: {
          campaignId,
          productId,
        },
      },
      create: {
        campaignId,
        productId,
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      update: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        product: true,
        campaign: true,
      },
    });
  }

  async unlinkProduct(campaignId: string, productId: string) {
    const campaignProduct = await this.prisma.campaignProduct.findUnique({
      where: {
        campaignId_productId: {
          campaignId,
          productId,
        },
      },
    });

    if (!campaignProduct) {
      throw new BadRequestException(
        `Product ${productId} is not linked to campaign ${campaignId}`
      );
    }

    return this.prisma.campaignProduct.delete({
      where: {
        campaignId_productId: {
          campaignId,
          productId,
        },
      },
      include: {
        product: true,
        campaign: true,
      },
    });
  }

  async getCampaignProducts(campaignId: string) {
    return this.prisma.campaignProduct.findMany({
      where: { campaignId },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
