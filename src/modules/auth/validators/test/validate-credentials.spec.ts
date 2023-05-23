import { validateCredentials } from '../validate-credentials';

describe('Validate Credentials', () => {
  const body = {
    email: 'ov@wugni.vg',
    password: 'Test!P4ssWord',
  };

  it('should return true', () => {
    const credentials = body;
    const response = validateCredentials(credentials);
    expect(response.success).toBe(true);
  });

  it('should return false (email error)', () => {
    const credentials = body;
    credentials.email = null;
    let response = validateCredentials(credentials);
    expect(response.success).toBe(false);
    credentials.email = 'invalidemailformat';
    response = validateCredentials(credentials);
    expect(response.success).toBe(false);
  });

  it('should return false (password error)', () => {
    const credentials = body;
    credentials.password = null;
    const response = validateCredentials(credentials);
    expect(response.success).toBe(false);
  });
});
