import { BadRequestException, Injectable } from '@nestjs/common';
import { CampaignRepository } from './campaign.repository';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { validateCreateCampaign } from './validators/validate-create-campaign';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { validateRegisterAdmin } from './validators/validate-register-admin';
import { User } from '@prisma/client';
import { DeleteCampaignUserDto } from './dto/delete-campaign-user.dto';
import { validateDeleteCampaignUser } from './validators/validate-delete-campaign-user';
import { FindRequestsQueryDto } from './dto/find-requests-query.dto';
import { FileRepository } from '../file/file.repository';
import { EditCampaignDto } from './dto/edit-campaign.dto';
import { validateEditCampaign } from './validators/validate-edit-campaign';
import { ApproveRequestDto } from './dto/approve-request.dto';
import { validateApproveInterest } from './validators/validate-approve-campaign';

@Injectable()
export class CampaignService {
  constructor(
    private campaignRepository: CampaignRepository,
    private fileRepository: FileRepository,
  ) {}

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
    const validate = validateCreateCampaign(createCampaignDto);
    if (!validate['success'])
      throw new BadRequestException(validate['error'].issues);
    return await this.campaignRepository.createCampaign(createCampaignDto);
  }

  async registerAdmin(campaignId: string, registerAdminDto: RegisterAdminDto) {
    const validate = validateRegisterAdmin(registerAdminDto);
    if (!validate['success'])
      throw new BadRequestException(validate['error'].issues);
    return await this.campaignRepository.registerAdmin(
      campaignId,
      registerAdminDto,
    );
  }

  async leaveCampaign(user: User, campaignId: string) {
    return await this.campaignRepository.leaveCampaign(user, campaignId);
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
    const validate = validateDeleteCampaignUser(deleteCampaignUserDto);
    if (!validate['success'])
      throw new BadRequestException(validate['error'].issues);
    return await this.campaignRepository.deleteCampaignUser(
      deleteCampaignUserDto,
      campaignId,
    );
  }

  async getCampaignsRequests(user: User) {
    return await this.campaignRepository.getCampaignsRequests(user);
  }

  async approveCampaignInterest(
    user: User,
    requestId: string,
    approveRequestDto: ApproveRequestDto,
  ) {
    const validate = validateApproveInterest(approveRequestDto);
    if (!validate['success'])
      throw new BadRequestException(validate['error'].issues);
    return await this.campaignRepository.approveCampaignInterest(
      user,
      requestId,
      approveRequestDto,
    );
  }

  async getUserRequests(user: User, query: FindRequestsQueryDto) {
    return await this.campaignRepository.getUserRequests(user, query);
  }

  async deleteCampaign(campaignId: string) {
    const { files } = await this.campaignRepository.deleteCampaign(campaignId);
    if (!files) return { message: 'Campaign deleted successfully' };
    files.forEach(async (file) => {
      await this.fileRepository.deleteFile(file.fileId);
    });
    return { message: 'Campaign deleted successfully' };
  }

  async updateCampaign(campaignId: string, editCampaignDto: EditCampaignDto) {
    const validate = validateEditCampaign(editCampaignDto);
    if (!validate['success'])
      throw new BadRequestException(validate['error'].issues);
    return await this.campaignRepository.updateCampaign(
      campaignId,
      editCampaignDto,
    );
  }
}
