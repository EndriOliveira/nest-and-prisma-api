import { validateForgotPassword } from '../validate-forgot-password';

describe('Validate Forgot Password', () => {
  it('should return true', () => {
    const response = validateForgotPassword({ email: 'test@example.com' });
    expect(response.success).toBe(true);
  });

  it('should return false (email error)', () => {
    let response = validateForgotPassword({ email: null });
    expect(response.success).toBe(false);
    response = validateForgotPassword({ email: 'invalidemailformat' });
    expect(response.success).toBe(false);
  });
});
