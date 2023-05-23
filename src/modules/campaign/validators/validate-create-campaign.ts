import { z } from 'zod';
import { CreateCampaignDto } from '../dto/create-campaign.dto';

export const validateCreateCampaign = (body: CreateCampaignDto) => {
  const Campaign = z.object({
    title: z.string().trim(),
  });
  return Campaign.safeParse(body);
};
