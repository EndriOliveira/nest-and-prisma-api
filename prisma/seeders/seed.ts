import { PrismaClient } from '@prisma/client';
import { UserRole } from '../../src/modules/user/enum/user-roles.enum';
import { genSalt, hash } from 'bcryptjs';
import { v4 as uuidV4 } from 'uuid';
import { formatCpf, formatPhone } from '../../src/utils/utils';
const prisma = new PrismaClient();

(async () => {
  await prisma.$connect();
  const userAlreadyExists = await prisma.user.findUnique({
    select: { role: true },
    where: { email: process.env.SUPER_USER_EMAIL },
  });

  if (userAlreadyExists) {
    await prisma.$disconnect();
    console.log('SUPER USER ALREADY EXISTS!');
    return;
  }

  const salt = await genSalt(10);
  await prisma.user.create({
    data: {
      id: uuidV4(),
      name: process.env.SUPER_USER_NAME,
      cpf: formatCpf(process.env.SUPER_USER_CPF),
      phone: formatPhone(process.env.SUPER_USER_PHONE),
      email: process.env.SUPER_USER_EMAIL,
      password: await hash(process.env.SUPER_USER_PASSWORD, salt),
      role: UserRole.SUPER_USER,
    },
  });
  await prisma.$disconnect();
  console.log('SUPER USER CREATED!');
  return;
})();
