import { z } from 'zod';
import { RegisterAdminDto } from '../dto/register-admin.dto';

export const validateRegisterAdmin = (body: RegisterAdminDto): void => {
  const CampaignAdmin = z.object({
    adminId: z.string().trim(),
  });
  CampaignAdmin.parse(body);
};
