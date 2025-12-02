import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInfluencerDto } from './dto/create-influencer.dto';
import { UpdateInfluencerDto } from './dto/update-influencer.dto';

@Injectable()
export class InfluencersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createInfluencerDto: CreateInfluencerDto) {
    return this.prisma.influencer.create({
      data: createInfluencerDto,
    });
  }

  async findAll() {
    return this.prisma.influencer.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const influencer = await this.prisma.influencer.findUnique({
      where: { id },
      include: {
        campaignLinks: {
          include: {
            campaign: true,
          },
        },
      },
    });

    if (!influencer) {
      throw new NotFoundException(`Influencer with ID ${id} not found`);
    }

    return influencer;
  }

  async update(id: string, updateInfluencerDto: UpdateInfluencerDto) {
    await this.findOne(id); // Check if exists

    return this.prisma.influencer.update({
      where: { id },
      data: updateInfluencerDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    return this.prisma.influencer.delete({
      where: { id },
    });
  }
}
