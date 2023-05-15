import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CampaignRepository } from './campaign.repository';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { validateCreateCampaign } from './validators/validate-create-campaign';

@Injectable()
export class CampaignService {
  constructor(private campaignRepository: CampaignRepository) {}

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
}
