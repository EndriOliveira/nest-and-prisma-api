import { PrismaClient } from '@prisma/client';
import { CreateCampaignDto } from './dto/create-campaign.dto';

export class CampaignRepository {
  constructor(private prismaClient: PrismaClient = new PrismaClient()) {}

  async createCampaign(createCampaignDto: CreateCampaignDto) {
    const { title } = createCampaignDto;
    return await this.prismaClient.campaign.create({
      data: {
        title,
      },
    });
  }
}
