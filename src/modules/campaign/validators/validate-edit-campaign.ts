import { z } from 'zod';
import { EditCampaignDto } from '../dto/edit-campaign.dto';

export const validateEditCampaign = (body: EditCampaignDto): void => {
  const Campaign = z.object({
    title: z.string().trim(),
  });
  Campaign.parse(body);
};
