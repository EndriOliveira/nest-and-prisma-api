import { z } from 'zod';
import { DeleteUserDto } from '../dto/delete-user.dto';

export const validateDeleteUser = (body: DeleteUserDto) => {
  const User = z.object({
    password: z.string().trim().max(255),
  });
  return User.safeParse(body);
};
