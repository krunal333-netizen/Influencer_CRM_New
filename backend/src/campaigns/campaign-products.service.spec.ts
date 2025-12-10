import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CampaignProductsService } from './campaign-products.service';
import { PrismaService } from '../prisma/prisma.service';
import { LinkProductDto } from './dto/link-product.dto';

describe('CampaignProductsService', () => {
  let service: CampaignProductsService;
  let prismaService: any;

  const mockCampaignProduct = {
    id: 'camp-prod-1',
    campaignId: 'campaign-1',
    productId: 'product-1',
    quantity: 10,
    plannedQty: 15,
    discount: 5.5,
    notes: 'Test notes',
    dueDate: new Date('2024-02-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
    campaign: {
      id: 'campaign-1',
      name: 'Test Campaign',
    },
    product: {
      id: 'product-1',
      name: 'Test Product',
      sku: 'TEST-SKU',
      asCode: 'AS-CODE',
      category: 'ELECTRONICS',
      stock: 100,
      price: 29.99,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignProductsService,
        {
          provide: PrismaService,
          useValue: {
            campaign: {
              findUnique: jest.fn(),
            },
            product: {
              findUnique: jest.fn(),
            },
            campaignProduct: {
              upsert: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CampaignProductsService>(CampaignProductsService);
    prismaService = module.get(PrismaService);
  });

  describe('linkProduct', () => {
    it('should link a product to a campaign', async () => {
      const linkDto: LinkProductDto = {
        productId: 'product-1',
        quantity: 10,
        plannedQty: 15,
        discount: 5.5,
        notes: 'Test notes',
        dueDate: '2024-02-01',
      };

      prismaService.campaign.findUnique.mockResolvedValue({ id: 'campaign-1' });
      prismaService.product.findUnique.mockResolvedValue({ id: 'product-1' });
      prismaService.campaignProduct.upsert.mockResolvedValue(
        mockCampaignProduct
      );

      const result = await service.linkProduct('campaign-1', linkDto);

      expect(prismaService.campaign.findUnique).toHaveBeenCalledWith({
        where: { id: 'campaign-1' },
      });
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'product-1' },
      });
      expect(result).toEqual(mockCampaignProduct);
    });

    it('should throw BadRequestException when campaign not found', async () => {
      prismaService.campaign.findUnique.mockResolvedValue(null);

      const linkDto: LinkProductDto = {
        productId: 'product-1',
        quantity: 10,
      };

      await expect(
        service.linkProduct('non-existent', linkDto)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when product not found', async () => {
      prismaService.campaign.findUnique.mockResolvedValue({ id: 'campaign-1' });
      prismaService.product.findUnique.mockResolvedValue(null);

      const linkDto: LinkProductDto = {
        productId: 'non-existent',
        quantity: 10,
      };

      await expect(service.linkProduct('campaign-1', linkDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should handle date conversion', async () => {
      const linkDto: LinkProductDto = {
        productId: 'product-1',
        quantity: 10,
        dueDate: '2024-02-01',
      };

      prismaService.campaign.findUnique.mockResolvedValue({ id: 'campaign-1' });
      prismaService.product.findUnique.mockResolvedValue({ id: 'product-1' });
      prismaService.campaignProduct.upsert.mockResolvedValue(
        mockCampaignProduct
      );

      await service.linkProduct('campaign-1', linkDto);

      expect(prismaService.campaignProduct.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            dueDate: new Date('2024-02-01'),
          }),
          update: expect.objectContaining({
            dueDate: new Date('2024-02-01'),
          }),
        })
      );
    });
  });

  describe('unlinkProduct', () => {
    it('should unlink a product from a campaign', async () => {
      prismaService.campaignProduct.findUnique.mockResolvedValue(
        mockCampaignProduct
      );
      prismaService.campaignProduct.delete.mockResolvedValue(
        mockCampaignProduct
      );

      const result = await service.unlinkProduct('campaign-1', 'product-1');

      expect(prismaService.campaignProduct.delete).toHaveBeenCalledWith({
        where: {
          campaignId_productId: {
            campaignId: 'campaign-1',
            productId: 'product-1',
          },
        },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockCampaignProduct);
    });

    it('should throw BadRequestException when link not found', async () => {
      prismaService.campaignProduct.findUnique.mockResolvedValue(null);

      await expect(
        service.unlinkProduct('campaign-1', 'product-1')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getCampaignProducts', () => {
    it('should get all products linked to a campaign', async () => {
      const mockProducts = [mockCampaignProduct];

      prismaService.campaignProduct.findMany.mockResolvedValue(mockProducts);

      const result = await service.getCampaignProducts('campaign-1');

      expect(prismaService.campaignProduct.findMany).toHaveBeenCalledWith({
        where: { campaignId: 'campaign-1' },
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
      expect(result).toEqual(mockProducts);
    });

    it('should return empty array when campaign has no products', async () => {
      prismaService.campaignProduct.findMany.mockResolvedValue([]);

      const result = await service.getCampaignProducts('campaign-1');

      expect(result).toEqual([]);
    });
  });
});
