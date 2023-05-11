import { PrismaClient } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { v4 as uuidV4 } from 'uuid';
import { genSalt, hash, compare } from 'bcryptjs';
import { formatCpf, formatPhone, formattedUsers } from 'src/utils/utils';
import { CredentialsDto } from '../auth/dto/credentials.dto';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { sign } from 'jsonwebtoken';

export class UserRepository {
  constructor(private prismaClient: PrismaClient = new PrismaClient()) {}

  private async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(10);
    return await hash(password, salt);
  }

  private async checkPassword(
    password: string,
    userPassword: string,
  ): Promise<boolean> {
    return await compare(password, userPassword);
  }

  async getUsers() {
    const query = await this.prismaClient.user.findMany({
      select: {
        id: true,
        name: true,
        cpf: true,
        phone: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    const users = formattedUsers(query);
    return users;
  }

  async createUser(createUserDto: CreateUserDto) {
    const { name, cpf, phone, email, password } = createUserDto;
    return await this.prismaClient.user.create({
      data: {
        id: uuidV4(),
        name,
        cpf: formatCpf(cpf),
        phone: formatPhone(phone),
        email,
        password: await this.hashPassword(password),
        role: 'USER',
      },
    });
  }

  async checkCredentials(credentialsDto: CredentialsDto) {
    const { email, password } = credentialsDto;
    const user = await this.prismaClient.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    if (!(await this.checkPassword(password, user.password)))
      throw new UnauthorizedException('Invalid credentials');

    const accessToken = await sign(
      { id: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '1h',
      },
    );

    const refreshToken = await sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: '1d',
      },
    );

    await this.prismaClient.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return { token: accessToken };
  }
}
