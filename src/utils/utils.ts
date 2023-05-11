import * as dayjs from 'dayjs';

export const formatDate = (date: Date) => {
  return dayjs(date).subtract(3, 'hours').format('DD/MM/YYYY');
};

export const formatHours = (date: Date) => {
  return dayjs(date).subtract(3, 'hours').format('HH:mm');
};

export const formatCpf = (cpf) => {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatPhone = (phone) => {
  return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

export const formattedUsers = (users) => {
  return users.map((user) => ({
    id: user.id,
    name: user.name,
    cpf: user.cpf,
    phone: user.phone,
    email: user.email,
    role: user.role,
    createdAt: formatDate(user.createdAt),
  }));
};
