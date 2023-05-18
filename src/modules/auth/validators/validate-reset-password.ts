import { z } from 'zod';
import { ResetPasswordDto } from '../dto/reset-password.dto';

export const validateResetPassword = (body: ResetPasswordDto): void => {
  const User = z.object({
    code: z.string().trim().max(255),
    password: z
      .string()
      .trim()
      .min(6)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        'Password must have minimum six characters, at least one uppercase letter, one lowercase letter, one number and one special character',
      )
      .max(255),
    confirmPassword: z.string().trim().max(255),
  });
  User.parse(body);
};
