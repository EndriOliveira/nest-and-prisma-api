import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CampaignRepository } from './campaign.repository';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { validateCreateCampaign } from './validators/validate-create-campaign';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { validateRegisterAdmin } from './validators/validate-register-admin';
import { User } from '@prisma/client';
import { DeleteCampaignUserDto } from './dto/delete-campaign-user.dto';
import { validateDeleteCampaignUser } from './validators/validate-delete-campaign-user';
import { FindRequestsQueryDto } from './dto/find-requests-query.dto';

@Injectable()
export class CampaignService {
  constructor(private campaignRepository: CampaignRepository) {}

  async getCampaigns() {
    return await this.campaignRepository.getCampaigns();
  }

  async getCampaignDetails(user: User, campaignId: string) {
    return await this.campaignRepository.getCampaignDetails(user, campaignId);
  }

  async getAdminCampaigns(user: User) {
    return await this.campaignRepository.getAdminCampaigns(user);
  }

  async createCampaign(createCampaignDto: CreateCampaignDto) {
    try {
      validateCreateCampaign(createCampaignDto);
    } catch (error) {
      if (error['name'] === 'ZodError') {
        throw new BadRequestException(error['issues']);
      } else {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }
    return await this.campaignRepository.createCampaign(createCampaignDto);
  }

  async registerAdmin(campaignId: string, registerAdminDto: RegisterAdminDto) {
    try {
      validateRegisterAdmin(registerAdminDto);
    } catch (error) {
      if (error['name'] === 'ZodError') {
        throw new BadRequestException(error['issues']);
      } else {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }
    return await this.campaignRepository.registerAdmin(
      campaignId,
      registerAdminDto,
    );
  }

  async registerCampaignInterest(user: User, campaignId: string) {
    return await this.campaignRepository.registerCampaignInterest(
      user,
      campaignId,
    );
  }

  async deleteCampaignUser(
    deleteCampaignUserDto: DeleteCampaignUserDto,
    campaignId: string,
  ) {
    try {
      validateDeleteCampaignUser(deleteCampaignUserDto);
    } catch (error) {
      if (error['name'] === 'ZodError') {
        throw new BadRequestException(error['issues']);
      } else {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }
    return await this.campaignRepository.deleteCampaignUser(
      deleteCampaignUserDto,
      campaignId,
    );
  }

  async getCampaignsRequests(user: User) {
    return await this.campaignRepository.getCampaignsRequests(user);
  }

  async approveCampaignInterest(user: User, requestId: string) {
    return await this.campaignRepository.approveCampaignInterest(
      user,
      requestId,
    );
  }

  async getUserRequests(user: User, query: FindRequestsQueryDto) {
    return await this.campaignRepository.getUserRequests(user, query);
  }
}
