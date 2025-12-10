import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, ConflictException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { InfluencersService } from './influencers.service';
import { CreateInfluencerDto } from './dto/create-influencer.dto';
import { UpdateInfluencerDto } from './dto/update-influencer.dto';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import { InstagramProfileData } from '../apify/types/apify.types';

@ApiTags('influencers')
@Controller('influencers')
@UseGuards(AccessTokenGuard)
export class InfluencersController {
  constructor(private readonly influencersService: InfluencersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new influencer' })
  @ApiResponse({ status: 201, description: 'Influencer created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createInfluencerDto: CreateInfluencerDto) {
    return this.influencersService.create(createInfluencerDto);
  }

  @Post('from-scraped-data')
  @ApiOperation({ 
    summary: 'Create influencer from scraped Instagram data',
    description: 'Creates an influencer using data scraped from Instagram profile. Automatically populates name, email, followers, bio, and profile URL.'
  })
  @ApiResponse({ status: 201, description: 'Influencer created successfully from scraped data' })
  @ApiResponse({ status: 409, description: 'Influencer with email already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createFromScrapedData(
    @Body() data: { 
      scrapedData: InstagramProfileData; 
      additionalData?: Partial<CreateInfluencerDto> 
    }
  ) {
    try {
      return await this.influencersService.createFromScrapedData(
        data.scrapedData,
        data.additionalData
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new ConflictException('Failed to create influencer from scraped data');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all influencers' })
  @ApiResponse({ status: 200, description: 'List of all influencers' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.influencersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get influencer by ID' })
  @ApiParam({ name: 'id', description: 'Influencer ID' })
  @ApiResponse({ status: 200, description: 'Influencer found' })
  @ApiResponse({ status: 404, description: 'Influencer not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.influencersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update influencer' })
  @ApiParam({ name: 'id', description: 'Influencer ID' })
  @ApiResponse({ status: 200, description: 'Influencer updated successfully' })
  @ApiResponse({ status: 404, description: 'Influencer not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@Param('id') id: string, @Body() updateInfluencerDto: UpdateInfluencerDto) {
    return this.influencersService.update(id, updateInfluencerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete influencer' })
  @ApiParam({ name: 'id', description: 'Influencer ID' })
  @ApiResponse({ status: 200, description: 'Influencer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Influencer not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string) {
    return this.influencersService.remove(id);
  }
}
