import {
  Controller,
  Post,
  UseGuards,
  Body,
  Param,
  Get,
  Delete,
} from '@nestjs/common';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UserRole } from '../user/enum/user-roles.enum';
import { Role } from '../auth/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guard/roles.guard';
import { CampaignService } from './campaign.service';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { User } from '@prisma/client';
import { DeleteCampaignUserDto } from './dto/delete-campaign-user.dto';

@Controller('campaign')
export class CampaignController {
  constructor(private campaignService: CampaignService) {}

  @Get('/')
  async getCampaigns() {
    return await this.campaignService.getCampaigns();
  }

  @Get('/admin/:campaignId')
  @UseGuards(AuthGuard(), RolesGuard)
  @Role(UserRole.ADMIN_USER)
  async getCampaignDetails(
    @GetUser() user: User,
    @Param('campaignId') campaignId: string,
  ) {
    return await this.campaignService.getCampaignDetails(user, campaignId);
  }

  @Get('/admin')
  @UseGuards(AuthGuard(), RolesGuard)
  @Role(UserRole.ADMIN_USER)
  async getAdminCampaigns(@GetUser() user: User) {
    return await this.campaignService.getAdminCampaigns(user);
  }

  @Post('/')
  @UseGuards(AuthGuard(), RolesGuard)
  @Role(UserRole.SUPER_USER)
  async createCampaign(@Body() createCampaignDto: CreateCampaignDto) {
    return await this.campaignService.createCampaign(createCampaignDto);
  }

  @Post('/:campaignId')
  @UseGuards(AuthGuard())
  async registerCampaignInterest(
    @GetUser() user: User,
    @Param('campaignId') campaignId: string,
  ) {
    return await this.campaignService.registerCampaignInterest(
      user,
      campaignId,
    );
  }

  @Post('/register-admin/:campaignId')
  @UseGuards(AuthGuard(), RolesGuard)
  @Role(UserRole.SUPER_USER)
  async registerAdmin(
    @Param('campaignId') campaignId: string,
    @Body() registerAdminDto: RegisterAdminDto,
  ) {
    return await this.campaignService.registerAdmin(
      campaignId,
      registerAdminDto,
    );
  }

  @Delete('/:campaignId')
  @UseGuards(AuthGuard(), RolesGuard)
  @Role(UserRole.SUPER_USER)
  async deleteCampaign() {
    return { message: 'Campaign deleted' };
  }

  @Delete('/admin/user/:campaignId')
  @UseGuards(AuthGuard(), RolesGuard)
  @Role(UserRole.ADMIN_USER)
  async deleteCampaignUser(
    @Body() deleteCampaignUserDto: DeleteCampaignUserDto,
    @Param('campaignId') campaignId: string,
  ) {
    return await this.campaignService.deleteCampaignUser(
      deleteCampaignUserDto,
      campaignId,
    );
  }
}
