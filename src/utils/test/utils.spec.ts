import { formatCpf, formatPhone, formatDate, formatHours } from '../utils';

describe('Utils', () => {
  it('should format cpf', () => {
    const response = formatCpf('06041625027');
    expect(response).toEqual('060.416.250-27');
  });

  it('should format phone', () => {
    const response = formatPhone('62999999999');
    expect(response).toEqual('(62) 99999-9999');
  });

  it('should format date', () => {
    const response = formatDate(new Date('2021-01-02T06:05:05.000Z'));
    expect(response).toEqual('02/01/2021');
  });

  it('should format hours', () => {
    const response = formatHours(new Date('2021-01-02T06:00:00.000Z'));
    expect(response).toEqual('00:00');
  });
});
