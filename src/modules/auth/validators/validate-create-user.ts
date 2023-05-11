import { z } from 'zod';
import { CreateUserDto } from '../../user/dto/create-user.dto';

export const validateCreateUser = (body: CreateUserDto): void => {
  const User = z.object({
    name: z.string().min(3).max(255).trim(),
    cpf: z
      .string()
      .regex(
        /^([0-9]{2}[\.]?[0-9]{3}[\.]?[0-9]{3}[\/]?[0-9]{4}[-]?[0-9]{2})|([0-9]{3}[\.]?[0-9]{3}[\.]?[0-9]{3}[-]?[0-9]{2})$/g,
        'Invalid CPF format',
      )
      .min(11)
      .trim(),
    phone: z.string().min(11).trim(),
    email: z.string().email().trim(),
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        'Password must have minimum six characters, at least one uppercase letter, one lowercase letter, one number and one special character',
      )
      .min(6)
      .max(255)
      .trim(),
    confirmPassword: z.string().max(255).trim(),
  });
  User.parse(body);
};
