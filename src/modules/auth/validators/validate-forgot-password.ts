import { z } from 'zod';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';

export const validateForgotPassword = (body: ForgotPasswordDto) => {
  const User = z.object({
    email: z.string().trim().email(),
  });
  return User.safeParse(body);
};
