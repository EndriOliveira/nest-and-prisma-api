import { Campaign, PrismaClient, User, UsersOnCampaigns } from '@prisma/client';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { v4 as uuidV4 } from 'uuid';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from '../user/enum/user-roles.enum';
import {
  formattedAdminCampaigns,
  formattedCampaign,
  formattedCampaignRequests,
  formattedCampaigns,
  formattedUserRequests,
} from '../../utils/utils';
import { DeleteCampaignUserDto } from './dto/delete-campaign-user.dto';
import { FindRequestsQueryDto } from './dto/find-requests-query.dto';
import { EditCampaignDto } from './dto/edit-campaign.dto';
import { ICampaignRepository } from './Icampaign.repository';
import { ApproveRequestDto } from './dto/approve-request.dto';

export class CampaignRepository implements ICampaignRepository {
  constructor(private prismaClient: PrismaClient = new PrismaClient()) {}

  async getCampaigns(): Promise<Campaign[]> {
    await this.prismaClient.$connect();
    try {
      const query = await this.prismaClient.campaign.findMany({
        include: {
          admin: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
            },
          },
          files: {
            include: {
              file: {
                select: {
                  id: true,
                  url: true,
                },
              },
            },
          },
        },
      });

      const campaigns = formattedCampaigns(query);
      await this.prismaClient.$disconnect();
      return campaigns;
    } catch (error) {
      await this.prismaClient.$disconnect();
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async getCampaignDetails(user: User, campaignId: string) {
    await this.prismaClient.$connect();
    const query = await this.prismaClient.campaign.findUnique({
      where: { id: campaignId },
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
        files: {
          include: {
            file: {
              select: {
                id: true,
                url: true,
              },
            },
          },
        },
        users: {
          where: { status: true },
          select: {
            status: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!query) {
      await this.prismaClient.$disconnect();
      throw new NotFoundException('Campaign does not exist');
    }
    if (query.adminId !== user.id && user.role !== UserRole.SUPER_USER) {
      await this.prismaClient.$disconnect();
      throw new UnauthorizedException('User is not the admin of this campaign');
    }

    const campaign = formattedCampaign(query);
    await this.prismaClient.$disconnect();
    return campaign;
  }

  async getAdminCampaigns(
    user: User,
  ): Promise<Campaign[] | { message: string }> {
    await this.prismaClient.$connect();
    try {
      const query = await this.prismaClient.campaign.findMany({
        where: { adminId: user.id },
        include: {
          users: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          files: {
            include: {
              file: {
                select: {
                  id: true,
                  url: true,
                },
              },
            },
          },
        },
      });

      if (query.length === 0) {
        await this.prismaClient.$disconnect();
        return {
          message: 'You are not managing any campaign',
        };
      } else {
        const campaigns = formattedAdminCampaigns(query);
        await this.prismaClient.$disconnect();
        return campaigns;
      }
    } catch (error) {
      await this.prismaClient.$disconnect();
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async createCampaign(
    createCampaignDto: CreateCampaignDto,
  ): Promise<Campaign> {
    await this.prismaClient.$connect();
    const { title } = createCampaignDto;
    try {
      const response = await this.prismaClient.campaign.create({
        data: {
          id: uuidV4(),
          title,
        },
      });
      await this.prismaClient.$disconnect();
      return response;
    } catch (error) {
      await this.prismaClient.$disconnect();
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async registerAdmin(
    campaignId: string,
    registerAdminDto: RegisterAdminDto,
  ): Promise<Campaign> {
    await this.prismaClient.$connect();
    const { adminId } = registerAdminDto;
    const adminExists = await this.prismaClient.user.findUnique({
      where: { id: adminId },
    });

    if (!adminExists) {
      await this.prismaClient.$disconnect();
      throw new NotFoundException('Admin does not exist');
    }
    if (adminExists.role !== UserRole.ADMIN_USER) {
      await this.prismaClient.$disconnect();
      throw new UnauthorizedException('User is not an admin');
    }
    try {
      const response = await this.prismaClient.campaign.update({
        where: { id: campaignId },
        data: {
          adminId,
        },
      });
      await this.prismaClient.$disconnect();
      return response;
    } catch (error) {
      await this.prismaClient.$disconnect();
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async registerCampaignInterest(
    user: User,
    campaignId: string,
  ): Promise<{ message: string }> {
    await this.prismaClient.$connect();
    const interestAlreadyExists =
      await this.prismaClient.usersOnCampaigns.findFirst({
        where: { AND: [{ campaignId }, { userId: user.id }] },
      });

    const campaignExists = await this.prismaClient.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaignExists) {
      await this.prismaClient.$disconnect();
      throw new NotFoundException('Campaign does not exist');
    }

    if (interestAlreadyExists) {
      await this.prismaClient.$disconnect();
      throw new ConflictException('Already registered');
    }
    try {
      await this.prismaClient.usersOnCampaigns.create({
        data: {
          id: uuidV4(),
          campaignId,
          userId: user.id,
        },
      });
      await this.prismaClient.$disconnect();
      return {
        message: 'User successfully registered on campaign',
      };
    } catch (error) {
      await this.prismaClient.$disconnect();
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async deleteCampaignUser(
    deleteCampaignUserDto: DeleteCampaignUserDto,
    campaignId: string,
  ): Promise<{ message: string }> {
    await this.prismaClient.$connect();
    const { userId } = deleteCampaignUserDto;
    const query = await this.prismaClient.usersOnCampaigns.findFirst({
      where: {
        AND: [{ campaignId }, { userId }],
      },
    });
    if (!query) {
      await this.prismaClient.$disconnect();
      throw new NotFoundException('User is not registered on this campaign');
    }
    try {
      await this.prismaClient.usersOnCampaigns.delete({
        where: { id: query.id },
      });
      await this.prismaClient.$disconnect();
      return {
        message: 'User successfully deleted from campaign',
      };
    } catch (error) {
      await this.prismaClient.$disconnect();
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async getCampaignsRequests(
    user: User,
  ): Promise<UsersOnCampaigns[] | { message: string }> {
    await this.prismaClient.$connect();
    try {
      const query = await this.prismaClient.usersOnCampaigns.findMany({
        where: { AND: [{ status: false }, { campaign: { adminId: user.id } }] },
        include: {
          campaign: {
            include: {
              admin: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  role: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
            },
          },
        },
      });
      if (query.length === 0) {
        await this.prismaClient.$disconnect();
        return { message: 'There are no requests for you in this moment' };
      }
      const requests = formattedCampaignRequests(query);
      await this.prismaClient.$disconnect();
      return requests;
    } catch (error) {
      await this.prismaClient.$disconnect();
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async approveCampaignInterest(
    user: User,
    requestId: string,
    approveRequestDto: ApproveRequestDto,
  ): Promise<{ message: string }> {
    await this.prismaClient.$connect();
    const { status } = approveRequestDto;
    const request = await this.prismaClient.usersOnCampaigns.findFirst({
      where: { id: requestId },
      include: {
        campaign: {
          include: {
            admin: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!request) {
      await this.prismaClient.$disconnect();
      throw new NotFoundException('Request does not exist');
    }

    if (
      user.role !== UserRole.SUPER_USER &&
      request.campaign.adminId !== user.id
    ) {
      await this.prismaClient.$disconnect();
      throw new UnauthorizedException('User is not the admin of this campaign');
    }

    if (request.status) {
      await this.prismaClient.$disconnect();
      return { message: 'Request already approved' };
    }

    try {
      if (status) {
        await this.prismaClient.usersOnCampaigns.update({
          where: { id: requestId },
          data: {
            status,
          },
        });
        await this.prismaClient.$disconnect();
        return {
          message: 'User successfully approved on campaign',
        };
      } else {
        await this.prismaClient.usersOnCampaigns.delete({
          where: { id: requestId },
        });
        await this.prismaClient.$disconnect();
        return {
          message: 'User successfully rejected from campaign',
        };
      }
    } catch (error) {
      await this.prismaClient.$disconnect();
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async getUserRequests(user: User, query: FindRequestsQueryDto) {
    await this.prismaClient.$connect();
    const { status } = query;
    let { limit, page, sort } = query;

    sort = sort || JSON.stringify({ createdAt: 'desc' });
    page = isNaN(page) ? 1 : page;
    limit = isNaN(limit) || limit > 100 ? 100 : limit;

    const keySort = sort ? Object.keys(JSON.parse(sort))[0] : undefined;
    let valueSort = sort ? Object.values(JSON.parse(sort))[0] : undefined;
    valueSort = `${valueSort}`.toLowerCase() == 'desc' ? 'desc' : 'asc';

    try {
      const requests = await this.prismaClient.usersOnCampaigns.findMany({
        where: {
          AND: [
            { userId: user.id },
            { status: status.toLowerCase() === 'false' ? false : true },
          ],
        },
        include: {
          campaign: {
            include: {
              admin: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  role: true,
                },
              },
              files: {
                include: {
                  file: {
                    select: {
                      id: true,
                      url: true,
                    },
                  },
                },
              },
            },
          },
        },
        skip: Number(page - 1) * Number(limit),
        take: Number(limit),
        orderBy: { [keySort]: valueSort },
      });
      if (requests.length === 0) {
        await this.prismaClient.$disconnect();
        return { message: 'There are no requests for you in this moment' };
      }
      const formattedRequests = formattedUserRequests(requests);
      await this.prismaClient.$disconnect();
      return formattedRequests;
    } catch (error) {
      await this.prismaClient.$disconnect();
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async leaveCampaign(
    user: User,
    campaignId: string,
  ): Promise<{ message: string }> {
    await this.prismaClient.$connect();
    const campaignRegister = await this.prismaClient.usersOnCampaigns.findFirst(
      {
        where: { AND: [{ campaignId }, { userId: user.id }] },
      },
    );

    if (!campaignRegister) {
      await this.prismaClient.$disconnect();
      throw new NotFoundException('User is not registered on this campaign');
    }
    try {
      await this.prismaClient.usersOnCampaigns.delete({
        where: { id: campaignRegister.id },
      });
      await this.prismaClient.$disconnect();
      return { message: 'User successfully deleted from campaign' };
    } catch (error) {
      await this.prismaClient.$disconnect();
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async deleteCampaign(campaignId: string) {
    await this.prismaClient.$connect();
    const campaign = await this.prismaClient.campaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) {
      await this.prismaClient.$disconnect();
      throw new NotFoundException('Campaign does not exist');
    }

    const files = await this.prismaClient.filesOnCampaigns.findMany({
      where: { campaignId },
    });

    try {
      await this.prismaClient.campaign.delete({
        where: { id: campaignId },
      });
      if (files.length > 0) {
        await this.prismaClient.$disconnect();
        return { files };
      }
      await this.prismaClient.$disconnect();
      return { message: 'Campaign deleted successfully' };
    } catch (error) {
      await this.prismaClient.$disconnect();
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async updateCampaign(
    campaignId: string,
    editCampaignDto: EditCampaignDto,
  ): Promise<Campaign> {
    await this.prismaClient.$connect();
    const { title } = editCampaignDto;
    const campaign = await this.prismaClient.campaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) {
      await this.prismaClient.$disconnect();
      throw new NotFoundException('Campaign does not exist');
    }
    try {
      const response = await this.prismaClient.campaign.update({
        where: { id: campaignId },
        data: {
          title: title.trim().length > 0 ? title : campaign.title,
        },
      });
      await this.prismaClient.$disconnect();
      return response;
    } catch (error) {
      await this.prismaClient.$disconnect();
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
