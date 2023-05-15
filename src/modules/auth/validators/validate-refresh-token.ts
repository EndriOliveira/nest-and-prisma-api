import { z } from 'zod';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

export const validateRefreshToken = (body: RefreshTokenDto): void => {
  const Token = z.object({
    refreshToken: z.string().trim(),
  });
  Token.parse(body);
};
