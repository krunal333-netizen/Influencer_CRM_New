import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: createProductDto,
      include: {
        campaignProducts: {
          include: {
            campaign: true,
          },
        },
      },
    });
  }

  async findAll(filterDto: ProductFilterDto = {}) {
    const { page = 1, limit = 10, search, category, sku, asCode } = filterDto;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(category && { category }),
      ...(sku && { sku }),
      ...(asCode && { asCode }),
    };

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          campaignProducts: {
            include: {
              campaign: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        campaignProducts: {
          include: {
            campaign: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        campaignProducts: {
          include: {
            campaign: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.product.delete({
      where: { id },
    });
  }

  async importFromCsv(
    rows: Array<Partial<CreateProductDto>>
  ): Promise<{
    successes: any[];
    errors: Array<{ row: number; error: string }>;
  }> {
    const successes: any[] = [];
    const errors: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 because rows are 0-indexed and header is row 1

      try {
        // Basic validation
        if (!row.name || !row.sku || typeof row.price !== 'number') {
          errors.push({
            row: rowNumber,
            error: 'Missing required fields: name, sku, or price',
          });
          continue;
        }

        // Check for duplicate SKU
        const existingBySku = await this.prisma.product.findUnique({
          where: { sku: row.sku },
        });

        if (existingBySku) {
          errors.push({
            row: rowNumber,
            error: `SKU "${row.sku}" already exists`,
          });
          continue;
        }

        // Check for duplicate asCode if provided
        if (row.asCode) {
          const existingByAsCode = await this.prisma.product.findUnique({
            where: { asCode: row.asCode },
          });

          if (existingByAsCode) {
            errors.push({
              row: rowNumber,
              error: `ASCode "${row.asCode}" already exists`,
            });
            continue;
          }
        }

        // Create product
        const product = await this.prisma.product.create({
          data: {
            name: row.name,
            sku: row.sku,
            asCode: row.asCode,
            description: row.description,
            category: row.category || 'OTHER',
            stock: row.stock || 0,
            price: row.price,
            imageUrls: row.imageUrls,
            metadata: row.metadata,
          },
          include: {
            campaignProducts: {
              include: {
                campaign: true,
              },
            },
          },
        });

        successes.push(product);
      } catch (error) {
        errors.push({
          row: rowNumber,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { successes, errors };
  }
}
