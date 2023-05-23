import {
  Controller,
  Post,
  UseGuards,
  Body,
  Param,
  Get,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
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
import { FindRequestsQueryDto } from './dto/find-requests-query.dto';
import { EditCampaignDto } from './dto/edit-campaign.dto';
import { ApproveRequestDto } from './dto/approve-request.dto';

@Controller('campaign')
@ApiTags('campaign')
export class CampaignController {
  constructor(private campaignService: CampaignService) {}

  @Get('/')
  async getCampaigns() {
    return await this.campaignService.getCampaigns();
  }

  @Get('/admin/:campaignId')
  @UseGuards(AuthGuard(), RolesGuard)
  @Role(UserRole.ADMIN_USER)
  @ApiBearerAuth()
  async getCampaignDetails(
    @GetUser() user: User,
    @Param('campaignId') campaignId: string,
  ) {
    return await this.campaignService.getCampaignDetails(user, campaignId);
  }

  @Get('/admin')
  @UseGuards(AuthGuard(), RolesGuard)
  @Role(UserRole.ADMIN_USER)
  @ApiBearerAuth()
  async getAdminCampaigns(@GetUser() user: User) {
    return await this.campaignService.getAdminCampaigns(user);
  }

  @Post('/')
  @UseGuards(AuthGuard(), RolesGuard)
  @Role(UserRole.SUPER_USER)
  @ApiBody({ type: CreateCampaignDto })
  @ApiBearerAuth()
  async createCampaign(@Body() createCampaignDto: CreateCampaignDto) {
    return await this.campaignService.createCampaign(createCampaignDto);
  }

  @Post('/:campaignId')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
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
  @ApiBody({ type: RegisterAdminDto })
  @ApiBearerAuth()
  async registerAdmin(
    @Param('campaignId') campaignId: string,
    @Body() registerAdminDto: RegisterAdminDto,
  ) {
    return await this.campaignService.registerAdmin(
      campaignId,
      registerAdminDto,
    );
  }

  @Delete('/exit/:campaignId')
  @UseGuards(AuthGuard(), RolesGuard)
  @Role(UserRole.NORMAL_USER)
  @ApiBearerAuth()
  async leaveCampaign(
    @GetUser() user: User,
    @Param('campaignId') campaignId: string,
  ) {
    return await this.campaignService.leaveCampaign(user, campaignId);
  }

  @Delete('/:campaignId')
  @UseGuards(AuthGuard(), RolesGuard)
  @Role(UserRole.SUPER_USER)
  @ApiBearerAuth()
  async deleteCampaign(@Param('campaignId') campaignId: string) {
    return await this.campaignService.deleteCampaign(campaignId);
  }

  @Delete('/admin/user/:campaignId')
  @UseGuards(AuthGuard(), RolesGuard)
  @Role(UserRole.ADMIN_USER)
  @ApiBody({ type: DeleteCampaignUserDto })
  @ApiBearerAuth()
  async deleteCampaignUser(
    @Body() deleteCampaignUserDto: DeleteCampaignUserDto,
    @Param('campaignId') campaignId: string,
  ) {
    return await this.campaignService.deleteCampaignUser(
      deleteCampaignUserDto,
      campaignId,
    );
  }

  @Get('/admin/user/requests')
  @UseGuards(AuthGuard(), RolesGuard)
  @Role(UserRole.ADMIN_USER)
  @ApiBearerAuth()
  async getCampaignsUsers(@GetUser() user: User) {
    return await this.campaignService.getCampaignsRequests(user);
  }

  @Get('/user/requests')
  @UseGuards(AuthGuard(), RolesGuard)
  @Role(UserRole.NORMAL_USER)
  @ApiBody({ type: FindRequestsQueryDto })
  @ApiBearerAuth()
  async getRequestsUser(
    @Query() query: FindRequestsQueryDto,
    @GetUser() user: User,
  ) {
    return await this.campaignService.getUserRequests(user, query);
  }

  @Put('/admin/requests/:requestId')
  @UseGuards(AuthGuard())
  @Role(UserRole.ADMIN_USER)
  @ApiBody({ type: ApproveRequestDto })
  @ApiBearerAuth()
  async approveCampaignInterest(
    @GetUser() user: User,
    @Param('requestId') requestId: string,
    @Body() approveRequestDto: ApproveRequestDto,
  ) {
    return await this.campaignService.approveCampaignInterest(
      user,
      requestId,
      approveRequestDto,
    );
  }

  @Put('/:campaignId')
  @UseGuards(AuthGuard(), RolesGuard)
  @Role(UserRole.SUPER_USER)
  @ApiBody({ type: EditCampaignDto })
  @ApiBearerAuth()
  async updateCampaign(
    @Param('campaignId') campaignId: string,
    @Body() editCampaignDto: EditCampaignDto,
  ) {
    return await this.campaignService.updateCampaign(
      campaignId,
      editCampaignDto,
    );
  }
}
