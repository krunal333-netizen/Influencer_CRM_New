import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let prismaService: any;

  const mockProduct = {
    id: 'product-1',
    name: 'Test Product',
    sku: 'TEST-SKU',
    asCode: 'AS-CODE',
    description: 'A test product',
    category: 'ELECTRONICS',
    stock: 100,
    price: 29.99,
    imageUrls: ['https://example.com/image1.jpg'],
    metadata: { color: 'blue' },
    createdAt: new Date(),
    updatedAt: new Date(),
    campaignProducts: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: {
            product: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prismaService = module.get(PrismaService);
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createDto: CreateProductDto = {
        name: 'Test Product',
        sku: 'TEST-SKU',
        price: 29.99,
      };

      prismaService.product.create.mockResolvedValue(mockProduct);

      const result = await service.create(createDto);

      expect(prismaService.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: createDto,
        })
      );
      expect(result).toEqual(mockProduct);
    });

    it('should create a product with all optional fields', async () => {
      const createDto: CreateProductDto = {
        name: 'Test Product',
        sku: 'TEST-SKU',
        asCode: 'AS-CODE',
        description: 'A test product',
        category: 'ELECTRONICS',
        stock: 100,
        price: 29.99,
        imageUrls: ['https://example.com/image1.jpg'],
        metadata: { color: 'blue' },
      };

      prismaService.product.create.mockResolvedValue(mockProduct);

      const result = await service.create(createDto);

      expect(result).toEqual(mockProduct);
    });
  });

  describe('findAll', () => {
    it('should return all products with pagination', async () => {
      const filterDto = { page: 1, limit: 10 };

      prismaService.product.findMany.mockResolvedValue([mockProduct]);
      prismaService.product.count.mockResolvedValue(1);

      const result = await service.findAll(filterDto);

      expect(result.data).toEqual([mockProduct]);
      expect(result.pagination).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        pages: 1,
      });
    });

    it('should filter products by category', async () => {
      const filterDto: any = { category: 'ELECTRONICS', page: 1, limit: 10 };

      prismaService.product.findMany.mockResolvedValue([mockProduct]);
      prismaService.product.count.mockResolvedValue(1);

      await service.findAll(filterDto);

      expect(prismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'ELECTRONICS' }),
        })
      );
    });

    it('should filter products by sku', async () => {
      const filterDto = { sku: 'TEST-SKU', page: 1, limit: 10 };

      prismaService.product.findMany.mockResolvedValue([mockProduct]);
      prismaService.product.count.mockResolvedValue(1);

      await service.findAll(filterDto);

      expect(prismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ sku: 'TEST-SKU' }),
        })
      );
    });

    it('should filter products by asCode', async () => {
      const filterDto = { asCode: 'AS-CODE', page: 1, limit: 10 };

      prismaService.product.findMany.mockResolvedValue([mockProduct]);
      prismaService.product.count.mockResolvedValue(1);

      await service.findAll(filterDto);

      expect(prismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ asCode: 'AS-CODE' }),
        })
      );
    });

    it('should search products by name and description', async () => {
      const filterDto = { search: 'test', page: 1, limit: 10 };

      prismaService.product.findMany.mockResolvedValue([mockProduct]);
      prismaService.product.count.mockResolvedValue(1);

      await service.findAll(filterDto);

      expect(prismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ name: expect.any(Object) }),
              expect.objectContaining({ description: expect.any(Object) }),
            ]),
          }),
        })
      );
    });

    it('should apply pagination correctly', async () => {
      const filterDto = { page: 2, limit: 5 };

      prismaService.product.findMany.mockResolvedValue([mockProduct]);
      prismaService.product.count.mockResolvedValue(15);

      const result = await service.findAll(filterDto);

      expect(prismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        })
      );
      expect(result.pagination.pages).toBe(3);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      prismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne('product-1');

      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      prismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateDto: UpdateProductDto = {
        name: 'Updated Product',
      };

      prismaService.product.findUnique.mockResolvedValue(mockProduct);
      prismaService.product.update.mockResolvedValue({
        ...mockProduct,
        name: 'Updated Product',
      });

      const result = await service.update('product-1', updateDto);

      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        data: updateDto,
        include: expect.any(Object),
      });
      expect(result.name).toBe('Updated Product');
    });

    it('should throw NotFoundException when product not found', async () => {
      prismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', {})).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      prismaService.product.findUnique.mockResolvedValue(mockProduct);
      prismaService.product.delete.mockResolvedValue(mockProduct);

      const result = await service.remove('product-1');

      expect(prismaService.product.delete).toHaveBeenCalledWith({
        where: { id: 'product-1' },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      prismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('importFromCsv', () => {
    it('should successfully import valid products', async () => {
      const rows: any[] = [
        {
          name: 'Product 1',
          sku: 'SKU-1',
          price: 10.0,
        },
        {
          name: 'Product 2',
          sku: 'SKU-2',
          price: 20.0,
          category: 'FASHION',
        },
      ];

      prismaService.product.findUnique.mockResolvedValue(null);
      prismaService.product.create.mockResolvedValue(mockProduct);

      const result = await service.importFromCsv(rows);

      expect(result.successes.length).toBe(2);
      expect(result.errors.length).toBe(0);
      expect(prismaService.product.create).toHaveBeenCalledTimes(2);
    });

    it('should reject rows with missing required fields', async () => {
      const rows: any[] = [
        {
          name: 'Product 1',
          sku: 'SKU-1',
          price: 10.0,
        },
        {
          name: 'Product 2',
          // Missing sku
          price: 20.0,
        },
      ];

      prismaService.product.findUnique.mockResolvedValue(null);
      prismaService.product.create.mockResolvedValue(mockProduct);

      const result = await service.importFromCsv(rows);

      expect(result.successes.length).toBe(1);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].row).toBe(3);
    });

    it('should reject rows with duplicate SKU', async () => {
      const rows: any[] = [
        {
          name: 'Product 1',
          sku: 'SKU-1',
          price: 10.0,
        },
      ];

      prismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.importFromCsv(rows);

      expect(result.successes.length).toBe(0);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].error).toContain('already exists');
    });

    it('should reject rows with duplicate asCode', async () => {
      const rows: any[] = [
        {
          name: 'Product 1',
          sku: 'SKU-1',
          asCode: 'AS-CODE-1',
          price: 10.0,
        },
      ];

      prismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.importFromCsv(rows);

      expect(result.successes.length).toBe(0);
      expect(result.errors.length).toBe(1);
    });

    it('should return pagination with result counts', async () => {
      const rows: any[] = [
        {
          name: 'Product 1',
          sku: 'SKU-1',
          price: 10.0,
        },
        {
          name: 'Product 2',
          // Missing sku
          price: 20.0,
        },
      ];

      prismaService.product.findUnique.mockResolvedValue(null);
      prismaService.product.create.mockResolvedValue(mockProduct);

      const result = await service.importFromCsv(rows);

      expect(result.successes.length + result.errors.length).toBe(2);
    });
  });
});
