import { z } from 'zod';
import { CredentialsDto } from '../dto/credentials.dto';

export const validateCredentials = (body: CredentialsDto): void => {
  const User = z.object({
    email: z.string().email().trim(),
    password: z.string().trim(),
  });
  User.parse(body);
};
