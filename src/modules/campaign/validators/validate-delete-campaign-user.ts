import { z } from 'zod';
import { DeleteCampaignUserDto } from '../dto/delete-campaign-user.dto';

export const validateDeleteCampaignUser = (body: DeleteCampaignUserDto) => {
  const User = z.object({
    userId: z.string().trim(),
  });
  return User.safeParse(body);
};
