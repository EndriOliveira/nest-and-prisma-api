import { z } from 'zod';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

export const validateRefreshToken = (body: RefreshTokenDto) => {
  const Token = z.object({
    refreshToken: z.string().trim(),
  });
  return Token.safeParse(body);
};
