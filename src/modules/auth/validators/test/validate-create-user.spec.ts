import { validateCreateUser } from '../validate-create-user';

describe('Validate Create User', () => {
  const body = {
    email: 'letoh@sokmofvu.mm',
    name: 'Maude Hunt',
    password: '123456Ab!',
    confirmPassword: '123456Ab!',
    cpf: '12939485732',
    phone: '11928374623',
  };

  it('should return true', () => {
    const user = body;
    const response = validateCreateUser(user);
    expect(response.success).toBe(true);
  });

  it('should return false (email error)', () => {
    const user = body;
    user.email = 'invalidemail';
    let response = validateCreateUser(user);
    expect(response.success).toBe(false);
    user.email = '            ';
    response = validateCreateUser(user);
    expect(response.success).toBe(false);
    user.email = null;
    response = validateCreateUser(user);
    expect(response.success).toBe(false);
  });

  it('should return false (name error)', () => {
    const user = body;
    user.name = 'M';
    let response = validateCreateUser(user);
    expect(response.success).toBe(false);
    user.name = '            ';
    response = validateCreateUser(user);
    expect(response.success).toBe(false);
    user.name = null;
    response = validateCreateUser(user);
    expect(response.success).toBe(false);
  });

  it('should return false (password error)', () => {
    const user = body;
    user.password = '123456Ab';
    let response = validateCreateUser(user);
    expect(response.success).toBe(false);
    user.password = '12345';
    response = validateCreateUser(user);
    expect(response.success).toBe(false);
    user.password = 'soletras';
    response = validateCreateUser(user);
    expect(response.success).toBe(false);
    user.password = '1234567890';
    response = validateCreateUser(user);
    expect(response.success).toBe(false);
    user.password = '!!!!!!!!';
    response = validateCreateUser(user);
    expect(response.success).toBe(false);
    user.password = '123testando';
    response = validateCreateUser(user);
    expect(response.success).toBe(false);
    user.password = '          ';
    response = validateCreateUser(user);
    expect(response.success).toBe(false);
    user.password = null;
    response = validateCreateUser(user);
    expect(response.success).toBe(false);
  });

  it('should return false (confirm password error)', () => {
    const user = body;
    user.confirmPassword = '     ';
    let response = validateCreateUser(user);
    expect(response.success).toBe(false);
    user.confirmPassword = null;
    response = validateCreateUser(user);
    expect(response.success).toBe(false);
  });

  it('should return false (cpf error)', () => {
    const user = body;
    user.cpf = '1234567890';
    let response = validateCreateUser(user);
    expect(response.success).toBe(false);
    user.cpf = '       ';
    response = validateCreateUser(user);
    expect(response.success).toBe(false);
    user.cpf = null;
    response = validateCreateUser(user);
    expect(response.success).toBe(false);
    user.cpf = 'letrasnocpf';
    response = validateCreateUser(user);
    expect(response.success).toBe(false);
  });

  it('should return false (phone error)', () => {
    const user = body;
    user.phone = '1234567890';
    let response = validateCreateUser(user);
    expect(response.success).toBe(false);
    user.phone = '       ';
    response = validateCreateUser(user);
    expect(response.success).toBe(false);
    user.phone = null;
    response = validateCreateUser(user);
    expect(response.success).toBe(false);
  });
});
