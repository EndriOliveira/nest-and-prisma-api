import { validateCPF } from '../validate-cpf';

describe('Validate CPF', () => {
  it('should return true', () => {
    const response = validateCPF('060.416.250-27');
    expect(response).toBe(true);
  });

  it('should throw', () => {
    expect(() => validateCPF('060.456.250-28')).toThrow();
  });
});
