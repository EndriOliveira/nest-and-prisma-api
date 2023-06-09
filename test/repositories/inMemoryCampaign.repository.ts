import {
  Campaign,
  User,
  FilesOnCampaigns,
  UsersOnCampaigns,
} from '@prisma/client';
import { v4 as uuidV4 } from 'uuid';
import { ICampaignRepository } from '../../src/modules/campaign/Icampaign.repository';
import { CreateCampaignDto } from '../../src/modules/campaign/dto/create-campaign.dto';
import { DeleteCampaignUserDto } from '../../src/modules/campaign/dto/delete-campaign-user.dto';
import { EditCampaignDto } from '../../src/modules/campaign/dto/edit-campaign.dto';
import { FindRequestsQueryDto } from '../../src/modules/campaign/dto/find-requests-query.dto';
import { RegisterAdminDto } from '../../src/modules/campaign/dto/register-admin.dto';
import { UserRole } from '../../src/modules/user/enum/user-roles.enum';
import { ApproveRequestDto } from 'src/modules/campaign/dto/approve-request.dto';

export class InMemoryCampaignRepository implements ICampaignRepository {
  private campaigns: Campaign[] = [];
  private usersOnCampaigns: UsersOnCampaigns[] = [];

  async getCampaigns(): Promise<Campaign[]> {
    const campaigns = this.campaigns.map((campaign) => ({
      id: campaign.id,
      title: campaign.title,
      createdAt: new Date(),
      updatedAt: new Date(),
      adminId: null,
    }));
    return Promise.resolve(campaigns);
  }

  async getCampaignDetails(user: User, campaignId: string): Promise<any> {
    const campaign = this.campaigns.find(
      (campaign) => campaign.id === campaignId,
    );
    return Promise.resolve(campaign);
  }

  async getAdminCampaigns(
    user: User,
  ): Promise<Campaign[] | { message: string }> {
    return Promise.resolve(
      this.campaigns.filter((campaign) => campaign.adminId === user.id),
    );
  }

  async createCampaign(
    createCampaignDto: CreateCampaignDto,
  ): Promise<Campaign> {
    const campaign = {
      id: uuidV4(),
      title: createCampaignDto.title,
      createdAt: new Date(),
      updatedAt: new Date(),
      adminId: null,
    };
    this.campaigns.push(campaign);
    return Promise.resolve(campaign);
  }

  async registerAdmin(
    campaignId: string,
    registerAdminDto: RegisterAdminDto,
  ): Promise<Campaign> {
    const campaign = this.campaigns.find(
      (campaign) => campaign.id === campaignId,
    );
    campaign.adminId = registerAdminDto.adminId;
    return Promise.resolve(campaign);
  }

  async registerCampaignInterest(
    user: User,
    campaignId: string,
  ): Promise<{ message: string }> {
    const interestAlreadyExists = this.usersOnCampaigns.find(
      (campaign) => campaign.id === campaignId && campaign.userId === user.id,
    );
    const campaignExists = this.campaigns.find(
      (campaign) => campaign.id === campaignId,
    );

    if (!campaignExists) return { message: 'Campaign does not exist' };
    if (interestAlreadyExists) return { message: 'Already registered' };

    this.usersOnCampaigns.push({
      id: uuidV4(),
      campaignId,
      userId: user.id,
      status: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      message: 'User successfully registered on campaign',
    };
  }

  async deleteCampaignUser(
    deleteCampaignUserDto: DeleteCampaignUserDto,
    campaignId: string,
  ): Promise<{ message: string }> {
    const query = this.usersOnCampaigns.find(
      (campaign) =>
        campaign.id === campaignId &&
        campaign.userId === deleteCampaignUserDto.userId,
    );
    if (!query) return { message: 'User is not registered on this campaign' };

    this.usersOnCampaigns = this.usersOnCampaigns.filter(
      (interest) => interest.id !== query.id,
    );
    return {
      message: 'User successfully deleted from campaign',
    };
  }

  async getCampaignsRequests(user: User) {
    const campaigns = this.usersOnCampaigns.filter(
      (campaign) => campaign.userId === user.id && campaign.status === false,
    );
    if (campaigns.length === 0)
      return { message: 'There are no requests for you in this moment' };

    return campaigns;
  }

  async approveCampaignInterest(
    user: User,
    requestId: string,
    approveRequestDto: ApproveRequestDto,
  ): Promise<{ message: string }> {
    const { status } = approveRequestDto;
    const interest = this.usersOnCampaigns.find(
      (interest) => interest.id === requestId,
    );
    const campaign = this.campaigns.find(
      (campaign) => campaign.id === interest.campaignId,
    );

    if (user.role !== UserRole.SUPER_USER && campaign.adminId !== user.id)
      return { message: 'User is not the admin of this campaign' };
    if (!interest) return { message: 'Request not found' };

    if (interest.status) return { message: 'Request already approved' };

    if (status) {
      interest.status = true;
      return {
        message: 'User successfully approved on campaign',
      };
    } else {
      this.usersOnCampaigns = this.usersOnCampaigns.filter(
        (interest) => interest.id !== requestId,
      );
      return {
        message: 'User successfully rejected on campaign',
      };
    }
  }

  async getUserRequests(user: User, query: FindRequestsQueryDto): Promise<any> {
    const status = query.status.toLowerCase() === 'true' ? true : false;
    return this.usersOnCampaigns.filter(
      (campaign) => campaign.userId === user.id && campaign.status === status,
    );
  }

  async leaveCampaign(
    user: User,
    campaignId: string,
  ): Promise<{ message: string }> {
    const campaign = this.usersOnCampaigns.find(
      (campaign) =>
        campaign.userId === user.id && campaign.campaignId === campaignId,
    );
    if (!campaign)
      return { message: 'User is not registered on this campaign' };

    this.usersOnCampaigns = this.usersOnCampaigns.filter(
      (campaign) => campaign.id !== campaign.id,
    );
    return { message: 'User successfully deleted from campaign' };
  }

  async deleteCampaign(
    campaignId: string,
  ): Promise<
    | { files: FilesOnCampaigns[]; message?: undefined }
    | { message: string; files?: undefined }
  > {
    this.campaigns = this.campaigns.filter(
      (campaign) => campaign.id !== campaignId,
    );
    this.usersOnCampaigns = this.usersOnCampaigns.filter(
      (campaign) => campaign.campaignId !== campaignId,
    );
    return { message: 'Campaign deleted successfully' };
  }

  async updateCampaign(
    campaignId: string,
    editCampaignDto: EditCampaignDto,
  ): Promise<Campaign> {
    const { title } = editCampaignDto;
    const campaign = this.campaigns.find(
      (campaign) => campaign.id === campaignId,
    );
    campaign.title = title ? title.trim() : campaign.title;
    return campaign;
  }
}
