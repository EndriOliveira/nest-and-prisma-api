import { z } from 'zod';
import { RegisterAdminDto } from '../dto/register-admin.dto';

export const validateRegisterAdmin = (body: RegisterAdminDto) => {
  const CampaignAdmin = z.object({
    adminId: z.string().trim(),
  });
  return CampaignAdmin.safeParse(body);
};
