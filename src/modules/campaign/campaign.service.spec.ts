import { CampaignService } from './campaign.service';
import { CampaignRepository } from './campaign.repository';
import { FileRepository } from '../file/file.repository';
import { InMemoryCampaignRepository } from '../../../test/repositories/inMemoryCampaign.repository';
import { InMemoryUserRepository } from '../../../test/repositories/inMemoryUser.repository';
import { UserRepository } from '../user/user.repository';
import { AuthService } from '../auth/auth.service';
import { InMemorySendgridService } from '../../../test/services/inMemorySendGrid.service';
import { SendgridService } from '../sendgrid/sendgrid.service';
import { UserRole } from '../user/enum/user-roles.enum';
import { InMemoryFileRepository } from '../../../test/repositories/inMemoryFile.repository';

describe('CampaignService', () => {
  let campaignService: CampaignService;
  let authService: AuthService;

  beforeEach(async () => {
    campaignService = new CampaignService(
      new InMemoryCampaignRepository() as unknown as CampaignRepository,
      new InMemoryFileRepository() as unknown as FileRepository,
    );
    authService = new AuthService(
      new InMemoryUserRepository() as unknown as UserRepository,
      new InMemorySendgridService() as unknown as SendgridService,
    );
  });

  it('should be defined', () => {
    expect(campaignService).toBeDefined();
  });

  it('should return a list of campaigns', async () => {
    const campaigns = await campaignService.getCampaigns();
    expect(campaigns).toBeDefined();
    expect(campaigns.length).toBeGreaterThanOrEqual(0);
  });

  it('should return a campaign', async () => {
    const user = await authService.createUser(
      {
        email: 'febtu@ni.pw',
        name: 'test',
        password: 'Password123!',
        cpf: '44176393025',
        confirmPassword: 'Password123!',
        phone: '12345678901',
      },
      UserRole.ADMIN_USER,
    );
    const campaign = await campaignService.createCampaign({
      title: 'test Campaign',
    });
    await campaignService.registerAdmin(campaign.id, {
      adminId: user.id,
    });
    const response = await campaignService.getCampaignDetails(
      user,
      campaign.id,
    );
    expect(response).toHaveProperty('id');
  });

  it('should delete a campaign', async () => {
    const campaign = await campaignService.createCampaign({
      title: 'test Campaign',
    });
    const response = await campaignService.deleteCampaign(campaign.id);
    expect(response).toStrictEqual({
      message: 'Campaign deleted successfully',
    });
  });

  it('should edit a campaign', async () => {
    const campaign = await campaignService.createCampaign({
      title: 'test Campaign',
    });
    const response = await campaignService.updateCampaign(campaign.id, {
      title: 'test Campaign 2',
    });
    expect(response.title).toBe('test Campaign 2');
  });

  it('should register interest and list', async () => {
    const user = await authService.createUser(
      {
        email: 'febtu@ni.pw',
        name: 'test',
        password: 'Password123!',
        cpf: '44176393025',
        confirmPassword: 'Password123!',
        phone: '12345678901',
      },
      UserRole.NORMAL_USER,
    );
    expect(user).toHaveProperty('id');
    const campaign = await campaignService.createCampaign({
      title: 'test Campaign',
    });
    expect(campaign).toHaveProperty('id');
    const interest = await campaignService.registerCampaignInterest(
      user,
      campaign.id,
    );
    expect(interest).toStrictEqual({
      message: 'User successfully registered on campaign',
    });
    const response = await campaignService.getUserRequests(user, {
      limit: 10,
      page: 1,
      sort: '{"createdAt": "DESC"}',
      status: 'false',
    });
    expect(response.length).toBe(1);
  });

  it('should register admin', async () => {
    const user = await authService.createUser(
      {
        email: 'febtu@ni.pw',
        name: 'test',
        password: 'Password123!',
        cpf: '44176393025',
        confirmPassword: 'Password123!',
        phone: '12345678901',
      },
      UserRole.ADMIN_USER,
    );
    const campaign = await campaignService.createCampaign({
      title: 'test Campaign',
    });
    await campaignService.registerAdmin(campaign.id, {
      adminId: user.id,
    });
    const response = await campaignService.getCampaignDetails(
      user,
      campaign.id,
    );
    expect(response['adminId']).toBe(user.id);
  });

  it('should leave camapign', async () => {
    const user = await authService.createUser(
      {
        email: 'febtu@ni.pw',
        name: 'test',
        password: 'Password123!',
        cpf: '44176393025',
        confirmPassword: 'Password123!',
        phone: '12345678901',
      },
      UserRole.NORMAL_USER,
    );
    expect(user).toHaveProperty('id');
    const campaign = await campaignService.createCampaign({
      title: 'test Campaign',
    });
    expect(campaign).toHaveProperty('id');
    const interest = await campaignService.registerCampaignInterest(
      user,
      campaign.id,
    );
    expect(interest).toStrictEqual({
      message: 'User successfully registered on campaign',
    });
    const response = await campaignService.leaveCampaign(user, campaign.id);
    expect(response).toStrictEqual({
      message: 'User successfully deleted from campaign',
    });
  });

  it('should accept user', async () => {
    const user = await authService.createUser(
      {
        email: 'febtu@ni.pw',
        name: 'test',
        password: 'Password123!',
        cpf: '44176393025',
        confirmPassword: 'Password123!',
        phone: '12345678901',
      },
      UserRole.NORMAL_USER,
    );
    const admin = await authService.createUser(
      {
        email: 'febtu@new.pw',
        name: 'test',
        password: 'Password123!',
        cpf: '17650859002',
        confirmPassword: 'Password123!',
        phone: '12345678901',
      },
      UserRole.SUPER_USER,
    );
    expect(user).toHaveProperty('id');
    const campaign = await campaignService.createCampaign({
      title: 'test Campaign',
    });
    expect(campaign).toHaveProperty('id');
    const interest = await campaignService.registerCampaignInterest(
      user,
      campaign.id,
    );
    await campaignService.registerAdmin(campaign.id, { adminId: admin.id });
    expect(interest).toStrictEqual({
      message: 'User successfully registered on campaign',
    });
    const getInterests = await campaignService.getCampaignsRequests(user);
    const response = await campaignService.approveCampaignInterest(
      admin,
      getInterests[0].id,
      { status: true },
    );
    expect(response).toStrictEqual({
      message: 'User successfully approved on campaign',
    });
  });

  it('should reject user', async () => {
    const user = await authService.createUser(
      {
        email: 'febtu@ni.pw',
        name: 'test',
        password: 'Password123!',
        cpf: '44176393025',
        confirmPassword: 'Password123!',
        phone: '12345678901',
      },
      UserRole.NORMAL_USER,
    );
    const admin = await authService.createUser(
      {
        email: 'febtu@new.pw',
        name: 'test',
        password: 'Password123!',
        cpf: '17650859002',
        confirmPassword: 'Password123!',
        phone: '12345678901',
      },
      UserRole.SUPER_USER,
    );
    expect(user).toHaveProperty('id');
    const campaign = await campaignService.createCampaign({
      title: 'test Campaign',
    });
    expect(campaign).toHaveProperty('id');
    const interest = await campaignService.registerCampaignInterest(
      user,
      campaign.id,
    );
    await campaignService.registerAdmin(campaign.id, { adminId: admin.id });
    expect(interest).toStrictEqual({
      message: 'User successfully registered on campaign',
    });
    const getInterests = await campaignService.getCampaignsRequests(user);
    const response = await campaignService.approveCampaignInterest(
      admin,
      getInterests[0].id,
      { status: false },
    );
    expect(response).toStrictEqual({
      message: 'User successfully rejected on campaign',
    });
  });

  it('should leave campaign', async () => {
    const user = await authService.createUser(
      {
        email: 'febtu@ni.pw',
        name: 'test',
        password: 'Password123!',
        cpf: '44176393025',
        confirmPassword: 'Password123!',
        phone: '12345678901',
      },
      UserRole.NORMAL_USER,
    );
    const admin = await authService.createUser(
      {
        email: 'febtu@new.pw',
        name: 'test',
        password: 'Password123!',
        cpf: '17650859002',
        confirmPassword: 'Password123!',
        phone: '12345678901',
      },
      UserRole.SUPER_USER,
    );
    expect(user).toHaveProperty('id');
    const campaign = await campaignService.createCampaign({
      title: 'test Campaign',
    });
    expect(campaign).toHaveProperty('id');
    const interest = await campaignService.registerCampaignInterest(
      user,
      campaign.id,
    );
    await campaignService.registerAdmin(campaign.id, { adminId: admin.id });
    expect(interest).toStrictEqual({
      message: 'User successfully registered on campaign',
    });
    const getInterests = await campaignService.getCampaignsRequests(user);
    const approve = await campaignService.approveCampaignInterest(
      admin,
      getInterests[0].id,
      { status: true },
    );
    expect(approve).toStrictEqual({
      message: 'User successfully approved on campaign',
    });
    const response = await campaignService.leaveCampaign(user, campaign.id);
    expect(response).toStrictEqual({
      message: 'User successfully deleted from campaign',
    });
  });

  it('should remove user from campaign', async () => {
    const user = await authService.createUser(
      {
        email: 'febtu@ni.pw',
        name: 'test',
        password: 'Password123!',
        cpf: '44176393025',
        confirmPassword: 'Password123!',
        phone: '12345678901',
      },
      UserRole.NORMAL_USER,
    );
    const admin = await authService.createUser(
      {
        email: 'febtu@new.pw',
        name: 'test',
        password: 'Password123!',
        cpf: '17650859002',
        confirmPassword: 'Password123!',
        phone: '12345678901',
      },
      UserRole.SUPER_USER,
    );
    expect(user).toHaveProperty('id');
    const campaign = await campaignService.createCampaign({
      title: 'test Campaign',
    });
    expect(campaign).toHaveProperty('id');
    const interest = await campaignService.registerCampaignInterest(
      user,
      campaign.id,
    );
    await campaignService.registerAdmin(campaign.id, { adminId: admin.id });
    expect(interest).toStrictEqual({
      message: 'User successfully registered on campaign',
    });
    const getInterests = await campaignService.getCampaignsRequests(user);
    const approve = await campaignService.approveCampaignInterest(
      admin,
      getInterests[0].id,
      { status: true },
    );
    expect(approve).toStrictEqual({
      message: 'User successfully approved on campaign',
    });
    const response = await campaignService.deleteCampaignUser(
      { userId: user.id },
      getInterests[0].id,
    );
    expect(response).toStrictEqual({
      message: 'User successfully deleted from campaign',
    });
  });
});
