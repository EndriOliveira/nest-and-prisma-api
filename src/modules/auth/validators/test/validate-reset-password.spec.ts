import { validateResetPassword } from '../validate-reset-password';

describe('Validate Reset Password', () => {
  const body = {
    code: 'AmJXmr',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };

  it('should return true', () => {
    const resetPassword = body;
    const response = validateResetPassword(resetPassword);
    expect(response.success).toBe(true);
  });

  it('should return false (code error)', () => {
    const resetPassword = body;
    resetPassword.code = null;
    const response = validateResetPassword(resetPassword);
    expect(response.success).toBe(false);
  });

  it('should return false (password error)', () => {
    const resetPassword = body;
    resetPassword.password = '123456Ab';
    let response = validateResetPassword(resetPassword);
    expect(response.success).toBe(false);
    resetPassword.password = '12345';
    response = validateResetPassword(resetPassword);
    expect(response.success).toBe(false);
    resetPassword.password = 'soletras';
    response = validateResetPassword(resetPassword);
    expect(response.success).toBe(false);
    resetPassword.password = '1234567890';
    response = validateResetPassword(resetPassword);
    expect(response.success).toBe(false);
    resetPassword.password = '!!!!!!!!';
    response = validateResetPassword(resetPassword);
    expect(response.success).toBe(false);
    resetPassword.password = '123testando';
    response = validateResetPassword(resetPassword);
    expect(response.success).toBe(false);
    resetPassword.password = '          ';
    response = validateResetPassword(resetPassword);
    expect(response.success).toBe(false);
    resetPassword.password = null;
    response = validateResetPassword(resetPassword);
    expect(response.success).toBe(false);
  });

  it('should return false (confirm password error)', () => {
    const resetPassword = body;
    resetPassword.confirmPassword = null;
    const response = validateResetPassword(resetPassword);
    expect(response.success).toBe(false);
  });
});
