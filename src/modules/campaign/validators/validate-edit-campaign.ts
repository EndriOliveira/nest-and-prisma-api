import { z } from 'zod';
import { EditCampaignDto } from '../dto/edit-campaign.dto';

export const validateEditCampaign = (body: EditCampaignDto) => {
  const Campaign = z.object({
    title: z.string().trim(),
  });
  return Campaign.safeParse(body);
};
