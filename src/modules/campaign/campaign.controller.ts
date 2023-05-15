import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UserRole } from '../user/enum/user-roles.enum';
import { Role } from '../auth/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guard/roles.guard';
import { CampaignService } from './campaign.service';

@Controller('campaign')
export class CampaignController {
  constructor(private campaignService: CampaignService) {}

  @Post('/')
  @UseGuards(AuthGuard(), RolesGuard)
  @Role(UserRole.SUPER_USER)
  async createCampaign(@Body() createCampaignDto: CreateCampaignDto) {
    return await this.campaignService.createCampaign(createCampaignDto);
  }
}
