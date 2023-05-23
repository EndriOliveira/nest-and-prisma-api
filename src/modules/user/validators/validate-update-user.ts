import { z } from 'zod';
import { UpdateUserDto } from '../dto/update-user.dto';

export const validateUpdateUser = (body: UpdateUserDto) => {
  const User = z.object({
    name: z.string().trim().min(2).max(255).optional(),
    cpf: z
      .string()
      .trim()
      .regex(
        /^([0-9]{2}[\.]?[0-9]{3}[\.]?[0-9]{3}[\/]?[0-9]{4}[-]?[0-9]{2})|([0-9]{3}[\.]?[0-9]{3}[\.]?[0-9]{3}[-]?[0-9]{2})$/g,
        'Invalid CPF format',
      )
      .min(11)
      .optional(),
    phone: z.string().trim().min(11).optional(),
    password: z.string().trim().max(255),
  });
  return User.safeParse(body);
};
