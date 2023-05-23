import { validateDeleteUser } from '../validate-delete-user';

describe('Validate Delete User', () => {
  it('should return false', () => {
    const response = validateDeleteUser({ password: null });
    expect(response.success).toBe(false);
  });

  it('should return true', () => {
    const response = validateDeleteUser({ password: 'senha123' });
    expect(response.success).toBe(true);
  });
});
