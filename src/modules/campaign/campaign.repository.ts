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
  formattedCampaigns,
} from 'src/utils/utils';
import { DeleteCampaignUserDto } from './dto/delete-campaign-user.dto';

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
      console.log(error);

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
}
