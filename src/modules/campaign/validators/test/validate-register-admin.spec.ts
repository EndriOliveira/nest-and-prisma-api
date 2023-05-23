import { validateRegisterAdmin } from '../validate-register-admin';

describe('Validate Register Admin', () => {
  it('should return true', () => {
    const response = validateRegisterAdmin({ adminId: 'Test Admin ID' });
    expect(response.success).toBe(true);
  });

  it('should return false', () => {
    const response = validateRegisterAdmin({ adminId: null });
    expect(response.success).toBe(false);
  });
});
