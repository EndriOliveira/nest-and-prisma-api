import { z } from 'zod';
import { DeleteUserDto } from '../dto/delete-user.dto';

export const validateDeleteUser = (body: DeleteUserDto): void => {
  const User = z.object({
    password: z.string().trim().max(255),
  });
  User.parse(body);
};
