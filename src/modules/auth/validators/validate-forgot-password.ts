import { z } from 'zod';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';

export const validateForgotPassword = (body: ForgotPasswordDto): void => {
  const User = z.object({
    email: z.string().trim().email(),
  });
  User.parse(body);
};
