import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Query,
  Patch,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CampaignProductsService } from './campaign-products.service';
import { CampaignInfluencersService } from './campaign-influencers.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CampaignFilterDto } from './dto/campaign-filter.dto';
import { LinkProductDto } from './dto/link-product.dto';
import { AssignInfluencerDto } from './dto/assign-influencer.dto';
import { AccessTokenGuard } from '../common/guards/access-token.guard';

@Controller('campaigns')
@UseGuards(AccessTokenGuard)
export class CampaignsController {
  constructor(
    private readonly campaignsService: CampaignsService,
    private readonly campaignProductsService: CampaignProductsService,
    private readonly campaignInfluencersService: CampaignInfluencersService
  ) {}

  @Post()
  create(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignsService.create(createCampaignDto);
  }

  @Get()
  findAll(@Query() filterDto: CampaignFilterDto) {
    return this.campaignsService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto
  ) {
    return this.campaignsService.update(id, updateCampaignDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.campaignsService.updateStatus(id, body.status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.campaignsService.remove(id);
  }

  // Influencer endpoints
  @Post(':id/influencers')
  assignInfluencer(
    @Param('id') id: string,
    @Body() assignInfluencerDto: AssignInfluencerDto
  ) {
    return this.campaignInfluencersService.assignInfluencer(
      id,
      assignInfluencerDto
    );
  }

  @Delete(':id/influencers/:influencerId')
  unassignInfluencer(
    @Param('id') id: string,
    @Param('influencerId') influencerId: string
  ) {
    return this.campaignInfluencersService.unassignInfluencer(id, influencerId);
  }

  @Get(':id/influencers')
  getCampaignInfluencers(@Param('id') id: string) {
    return this.campaignInfluencersService.getCampaignInfluencers(id);
  }

  // Product endpoints
  @Post(':id/products')
  linkProduct(@Param('id') id: string, @Body() linkProductDto: LinkProductDto) {
    return this.campaignProductsService.linkProduct(id, linkProductDto);
  }

  @Delete(':id/products/:productId')
  unlinkProduct(
    @Param('id') id: string,
    @Param('productId') productId: string
  ) {
    return this.campaignProductsService.unlinkProduct(id, productId);
  }

  @Get(':id/products')
  getCampaignProducts(@Param('id') id: string) {
    return this.campaignProductsService.getCampaignProducts(id);
  }
}
