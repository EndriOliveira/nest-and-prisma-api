import { z } from 'zod';
import { ChangePasswordDto } from '../dto/change-password.dto';

export const validateChangePassword = (body: ChangePasswordDto) => {
  const User = z.object({
    password: z.string().trim().max(255),
    newPassword: z
      .string()
      .trim()
      .min(6)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        'Password must have minimum six characters, at least one uppercase letter, one lowercase letter, one number and one special character',
      )
      .max(255),
    confirmNewPassword: z.string().trim().max(255),
  });
  return User.safeParse(body);
};
