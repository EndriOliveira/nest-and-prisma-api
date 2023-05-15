import { z } from 'zod';
import { CreateCampaignDto } from '../dto/create-campaign.dto';

export const validateCreateCampaign = (body: CreateCampaignDto): void => {
  const Campaign = z.object({
    title: z.string().trim(),
  });
  Campaign.parse(body);
};
