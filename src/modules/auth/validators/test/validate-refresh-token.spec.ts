import { validateRefreshToken } from '../validate-refresh-token';

describe('Validate Refresh Token', () => {
  it('should return true', () => {
    const response = validateRefreshToken({
      refreshToken: 'zyJyhAPNsFJIq5KfAYCJWRcm2tA2VJ',
    });
    expect(response.success).toBe(true);
  });

  it('should return false (refresh token error)', () => {
    const response = validateRefreshToken({
      refreshToken: null,
    });
    expect(response.success).toBe(false);
  });
});
