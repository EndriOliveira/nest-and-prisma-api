import { validateUpdateUser } from '../validate-update-user';

describe('Validate Update User', () => {
  it('should return false', () => {
    const response = validateUpdateUser({
      name: 'Teste',
      cpf: '12345678922',
      phone: null,
      password: '12345678901',
    });
    expect(response.success).toBe(false);
  });

  it('should return false', () => {
    const response = validateUpdateUser({
      name: 'Teste',
      cpf: '12345678922',
      phone: '123123',
      password: '12345678901',
    });
    expect(response.success).toBe(false);
  });

  it('should return false', () => {
    const response = validateUpdateUser({
      name: 'Teste',
      cpf: null,
      phone: '12312312312',
      password: '12345678901',
    });
    expect(response.success).toBe(false);
  });

  it('should return false', () => {
    const response = validateUpdateUser({
      name: 'T',
      cpf: '12345678922',
      phone: '12312312312',
      password: '12345678901',
    });
    expect(response.success).toBe(false);
  });

  it('should return false', () => {
    const response = validateUpdateUser({
      name: null,
      cpf: '12345678922',
      phone: '12312312312',
      password: '12345678901',
    });
    expect(response.success).toBe(false);
  });

  it('should return true', () => {
    const response = validateUpdateUser({
      name: 'Teste',
      cpf: '12345678911',
      password: '12345678901',
    });
    expect(response.success).toBe(true);
  });
});
