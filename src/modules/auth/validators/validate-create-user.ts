import { z } from 'zod';
import { CreateUserDto } from '../../user/dto/create-user.dto';

export const validateCreateUser = (body: CreateUserDto) => {
  const User = z.object({
    name: z.string().trim().min(2).max(255),
    cpf: z
      .string()
      .trim()
      .min(11)
      .regex(
        /^([0-9]{2}[\.]?[0-9]{3}[\.]?[0-9]{3}[\/]?[0-9]{4}[-]?[0-9]{2})|([0-9]{3}[\.]?[0-9]{3}[\.]?[0-9]{3}[-]?[0-9]{2})$/g,
        'Invalid CPF format',
      ),
    phone: z.string().trim().min(11),
    email: z.string().trim().email(),
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
  return User.safeParse(body);
};
