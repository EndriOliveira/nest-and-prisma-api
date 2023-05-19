import { PrismaClient, User } from '@prisma/client';
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

export class CampaignRepository {
  constructor(private prismaClient: PrismaClient = new PrismaClient()) {}

  async getCampaigns() {
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
      return campaigns;
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async getCampaignDetails(user: User, campaignId: string) {
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
          select: {
            userId: true,
          },
        },
      },
    });

    if (!query) throw new NotFoundException('Campaign does not exist');
    if (query.adminId !== user.id && user.role !== UserRole.SUPER_USER)
      throw new UnauthorizedException('User is not the admin of this campaign');

    const campaign = formattedCampaign(query);
    return campaign;
  }

  async getAdminCampaigns(user: User) {
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

      const campaigns = formattedAdminCampaigns(query);
      return campaigns;
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async createCampaign(createCampaignDto: CreateCampaignDto) {
    const { title } = createCampaignDto;
    try {
      return await this.prismaClient.campaign.create({
        data: {
          id: uuidV4(),
          title,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async registerAdmin(campaignId: string, registerAdminDto: RegisterAdminDto) {
    const { adminId } = registerAdminDto;
    const adminExists = await this.prismaClient.user.findUnique({
      where: { id: adminId },
    });

    if (!adminExists) throw new NotFoundException('Admin does not exist');
    if (adminExists.role !== UserRole.ADMIN_USER)
      throw new UnauthorizedException('User is not an admin');
    try {
      return await this.prismaClient.campaign.update({
        where: { id: campaignId },
        data: {
          adminId,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async registerCampaignInterest(user: User, campaignId: string) {
    const interestAlreadyExists =
      await this.prismaClient.usersOnCampaigns.findFirst({
        where: { AND: [{ campaignId }, { userId: user.id }] },
      });

    const campaignExists = await this.prismaClient.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaignExists) throw new NotFoundException('Campaign does not exist');

    if (interestAlreadyExists)
      throw new ConflictException('Already registered');

    try {
      await this.prismaClient.usersOnCampaigns.create({
        data: {
          id: uuidV4(),
          campaignId,
          userId: user.id,
        },
      });
      return {
        message: 'User successfully registered on campaign',
      };
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async deleteCampaignUser(
    deleteCampaignUserDto: DeleteCampaignUserDto,
    campaignId: string,
  ) {
    const { userId } = deleteCampaignUserDto;
    const query = await this.prismaClient.usersOnCampaigns.findFirst({
      where: {
        AND: [{ campaignId }, { userId }],
      },
    });
    if (!query)
      throw new NotFoundException('User is not registered on this campaign');
    try {
      await this.prismaClient.usersOnCampaigns.delete({
        where: { id: query.id },
      });
      return {
        message: 'User successfully deleted from campaign',
      };
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async getCampaignsRequests(user: User) {
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
      if (query.length === 0)
        return { message: 'There are no requests for you in this moment' };
      const requests = formattedCampaignRequests(query);
      return requests;
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async approveCampaignInterest(user: User, requestId: string) {
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

    if (!request) throw new NotFoundException('Request does not exist');

    if (
      user.role !== UserRole.SUPER_USER &&
      request.campaign.adminId !== user.id
    )
      throw new UnauthorizedException('User is not the admin of this campaign');

    if (request.status) return { message: 'Request already approved' };

    try {
      await this.prismaClient.usersOnCampaigns.update({
        where: { id: requestId },
        data: {
          status: true,
        },
      });
      return {
        message: 'User successfully approved on campaign',
      };
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async getUserRequests(user: User, query: FindRequestsQueryDto) {
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
      if (requests.length === 0)
        return { message: 'There are no requests for you in this moment' };
      const formattedRequests = formattedUserRequests(requests);
      return formattedRequests;
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async leaveCampaign(user: User, campaignId: string) {
    const campaignRegister = await this.prismaClient.usersOnCampaigns.findFirst(
      {
        where: { AND: [{ campaignId }, { userId: user.id }] },
      },
    );

    if (!campaignRegister)
      throw new NotFoundException('User is not registered on this campaign');

    try {
      await this.prismaClient.usersOnCampaigns.delete({
        where: { id: campaignRegister.id },
      });
      return { message: 'User successfully deleted from campaign' };
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async deleteCampaign(campaignId: string) {
    const campaign = await this.prismaClient.campaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) throw new NotFoundException('Campaign does not exist');

    const files = await this.prismaClient.filesOnCampaigns.findMany({
      where: { campaignId },
    });

    try {
      await this.prismaClient.campaign.delete({
        where: { id: campaignId },
      });
      if (files.length > 0) return { files };
      return { message: 'Campaign deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async updateCampaign(campaignId: string, editCampaignDto: EditCampaignDto) {
    const { title } = editCampaignDto;
    const campaign = await this.prismaClient.campaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) throw new NotFoundException('Campaign does not exist');

    try {
      return await this.prismaClient.campaign.update({
        where: { id: campaignId },
        data: {
          title: title.trim().length > 0 ? title : campaign.title,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
