import { z } from 'zod';
import { CredentialsDto } from '../dto/credentials.dto';

export const validateCredentials = (body: CredentialsDto): void => {
  const User = z.object({
    email: z.string().trim().email(),
    password: z.string().trim(),
  });
  User.parse(body);
};
