import { z } from 'zod';
import { DeleteCampaignUserDto } from '../dto/delete-campaign-user.dto';

export const validateDeleteCampaignUser = (
  body: DeleteCampaignUserDto,
): void => {
  const User = z.object({
    userId: z.string().trim(),
  });
  User.parse(body);
};
