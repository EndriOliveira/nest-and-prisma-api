import { Campaign, FilesOnCampaigns, User } from '@prisma/client';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { DeleteCampaignUserDto } from './dto/delete-campaign-user.dto';
import { FindRequestsQueryDto } from './dto/find-requests-query.dto';
import { EditCampaignDto } from './dto/edit-campaign.dto';
import { ApproveRequestDto } from './dto/approve-request.dto';

export interface ICampaignRepository {
  getCampaigns(): Promise<Campaign[]>;
  getCampaignDetails(user: User, campaignId: string): Promise<any>;
  getAdminCampaigns(user: User): Promise<Campaign[]>;
  createCampaign(createCampaignDto: CreateCampaignDto): Promise<Campaign>;
  registerAdmin(
    campaignId: string,
    registerAdminDto: RegisterAdminDto,
  ): Promise<Campaign>;
  registerCampaignInterest(
    user: User,
    campaignId: string,
  ): Promise<{ message: string }>;
  deleteCampaignUser(
    deleteCampaignUserDto: DeleteCampaignUserDto,
    campaignId: string,
  ): Promise<{ message: string }>;
  getCampaignsRequests(user: User): Promise<any>;
  approveCampaignInterest(
    user: User,
    requestId: string,
    approveRequestDto: ApproveRequestDto,
  ): Promise<{ message: string }>;
  getUserRequests(user: User, query: FindRequestsQueryDto): Promise<any>;
  leaveCampaign(user: User, campaignId: string): Promise<{ message: string }>;
  deleteCampaign(
    campaignId: string,
  ): Promise<
    | { files: FilesOnCampaigns[]; message?: undefined }
    | { message: string; files?: undefined }
  >;
  updateCampaign(
    campaignId: string,
    editCampaignDto: EditCampaignDto,
  ): Promise<Campaign>;
}
