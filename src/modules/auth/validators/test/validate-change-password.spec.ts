import { validateChangePassword } from '../validate-change-password';

describe('Validate Change Password', () => {
  const body = {
    password: 'Last!P4ssWord',
    newPassword: '123456Ab!',
    confirmNewPassword: '123456Ab!',
  };

  it('should return true', () => {
    const passwordReset = body;
    const response = validateChangePassword(passwordReset);
    expect(response.success).toBe(true);
  });

  it('should return false (password error)', () => {
    const passwordReset = body;
    passwordReset.password = null;
    const response = validateChangePassword(passwordReset);
    expect(response.success).toBe(false);
  });

  it('should return false (newPassword error)', () => {
    const passwordReset = body;
    passwordReset.newPassword = '123456Ab';
    let response = validateChangePassword(passwordReset);
    expect(response.success).toBe(false);
    passwordReset.newPassword = '12345';
    response = validateChangePassword(passwordReset);
    expect(response.success).toBe(false);
    passwordReset.newPassword = 'soletras';
    response = validateChangePassword(passwordReset);
    expect(response.success).toBe(false);
    passwordReset.newPassword = '1234567890';
    response = validateChangePassword(passwordReset);
    expect(response.success).toBe(false);
    passwordReset.newPassword = '!!!!!!!!';
    response = validateChangePassword(passwordReset);
    expect(response.success).toBe(false);
    passwordReset.newPassword = '123testando';
    response = validateChangePassword(passwordReset);
    expect(response.success).toBe(false);
    passwordReset.newPassword = '          ';
    response = validateChangePassword(passwordReset);
    expect(response.success).toBe(false);
    passwordReset.newPassword = null;
    response = validateChangePassword(passwordReset);
    expect(response.success).toBe(false);
  });

  it('should return false (confirmNewPassword error)', () => {
    const passwordReset = body;
    passwordReset.confirmNewPassword = null;
    const response = validateChangePassword(passwordReset);
    expect(response.success).toBe(false);
  });
});
