import { PrismaClient, User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { v4 as uuidV4 } from 'uuid';
import { genSalt, hash, compare } from 'bcryptjs';
import { formatCpf, formatPhone, formattedUsers } from '../../utils/utils';
import { CredentialsDto } from '../auth/dto/credentials.dto';
import {
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';
import { RefreshTokenDto } from '../auth/dto/refresh-token.dto';
import { UserRole } from './enum/user-roles.enum';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from '../auth/dto/change-password.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { ForgotPasswordDto } from '../auth/dto/forgot-password.dto';
import * as dayjs from 'dayjs';
import { ResetPasswordDto } from '../auth/dto/reset-password.dto';

export class UserRepository {
  constructor(private prismaClient: PrismaClient = new PrismaClient()) {}

  private async hashPassword(password: string): Promise<string> {
    try {
      const salt = await genSalt(10);
      return await hash(password, salt);
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  private async checkPassword(
    password: string,
    userPassword: string,
  ): Promise<boolean> {
    try {
      return await compare(password, userPassword);
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  private validateRefreshToken(refreshToken: string) {
    try {
      return verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getUserById(id: string) {
    const user = await this.prismaClient.user.findUnique({
      where: { id },
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
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getUsers(query: FindUsersQueryDto) {
    let { name, email, role, page, limit, sort } = query;

    name = name ? name.trim() : '';
    email = email ? email.trim() : '';
    role = role ? role.trim() : '';
    sort = sort || JSON.stringify({ createdAt: 'desc' });
    page = isNaN(page) ? 1 : page;
    limit = isNaN(limit) || limit > 100 ? 100 : limit;

    const keySort = sort ? Object.keys(JSON.parse(sort))[0] : undefined;
    let valueSort = sort ? Object.values(JSON.parse(sort))[0] : undefined;
    valueSort = `${valueSort}`.toLowerCase() == 'desc' ? 'desc' : 'asc';
    try {
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
        where: {
          AND: [
            { name: { contains: name, mode: 'insensitive' } },
            { email: { contains: email, mode: 'insensitive' } },
            { role: { contains: role, mode: 'insensitive' } },
          ],
        },
        skip: Number(page - 1) * Number(limit),
        take: Number(limit),
        orderBy: { [keySort]: valueSort },
      });
      const users = formattedUsers(query);
      return users;
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async createUser(createUserDto: CreateUserDto, role: UserRole) {
    const { name, cpf, phone, email, password } = createUserDto;
    const userExists = await this.prismaClient.user.findMany({
      where: { OR: [{ cpf }, { email }] },
    });
    if (userExists.length > 0)
      throw new ConflictException('Email/CPF already exists');
    try {
      return await this.prismaClient.user.create({
        data: {
          id: uuidV4(),
          name,
          cpf: formatCpf(cpf),
          phone: formatPhone(phone),
          email,
          password: await this.hashPassword(password),
          role,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async checkCredentials(credentialsDto: CredentialsDto) {
    const { email, password } = credentialsDto;
    const user = await this.prismaClient.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
        role: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    if (!(await this.checkPassword(password, user.password)))
      throw new UnauthorizedException('Invalid credentials');
    if (user.role === UserRole.UNREGISTERED)
      throw new UnauthorizedException(
        'An administrator must approve your registration before you can log in',
      );
    try {
      const accessToken = sign(
        { id: user.id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' },
      );
      const refreshToken = sign(
        { id: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' },
      );
      await this.prismaClient.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });

      return { token: accessToken, refreshToken };
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async refreshToken({ refreshToken }: RefreshTokenDto) {
    this.validateRefreshToken(refreshToken);
    const user = await this.prismaClient.user.findUnique({
      where: { refreshToken },
      select: {
        id: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    try {
      const accessToken = sign(
        { id: user.id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' },
      );
      return { token: accessToken };
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async approveUser(userId: string) {
    const user = await this.prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.role != UserRole.UNREGISTERED)
      return { message: 'User already approved' };

    try {
      await this.prismaClient.user.update({
        where: { id: userId },
        data: { role: UserRole.NORMAL_USER },
      });
      return { message: 'User approved' };
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async updateUser(user: User, updateUserDto: UpdateUserDto) {
    const { name, cpf, phone, password } = updateUserDto;
    const userExists = await this.prismaClient.user.findUnique({
      where: { id: user.id },
    });
    if (!userExists) throw new NotFoundException('User not found');

    if (!(await this.checkPassword(password, userExists.password)))
      throw new UnauthorizedException('Invalid credentials');

    try {
      return await this.prismaClient.user.update({
        where: { id: user.id },
        data: {
          name: name ? name : userExists.name,
          cpf: cpf ? formatCpf(cpf) : userExists.cpf,
          phone: phone ? formatPhone(phone) : userExists.phone,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async changePassword(user: User, changePasswordDto: ChangePasswordDto) {
    const { password, newPassword } = changePasswordDto;
    const userExists = await this.prismaClient.user.findUnique({
      where: { id: user.id },
    });
    if (!userExists) throw new NotFoundException('User not found');
    if (!(await this.checkPassword(password, userExists.password)))
      throw new UnauthorizedException('Invalid credentials');

    try {
      return await this.prismaClient.user.update({
        where: { id: user.id },
        data: {
          password: await this.hashPassword(newPassword),
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async deleteUser(user: User, deleteUserDto: DeleteUserDto) {
    const { password } = deleteUserDto;
    const userExists = await this.prismaClient.user.findUnique({
      where: { id: user.id },
    });
    if (!userExists) throw new NotFoundException('User not found');
    if (!(await this.checkPassword(password, userExists.password)))
      throw new UnauthorizedException('Invalid credentials');

    try {
      await this.prismaClient.user.delete({ where: { id: user.id } });
      return { message: 'User deleted' };
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto, code: string) {
    const { email } = forgotPasswordDto;
    try {
      await this.prismaClient.user.update({
        where: { email },
        data: {
          code,
          resetPasswordExpires: dayjs(Date.now() + 3600000)
            .subtract(3, 'hours')
            .format(),
        },
      });
      return { message: 'Email sent' };
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async findUserByEmail(email: string) {
    const user = await this.prismaClient.user.findUnique({
      where: { email },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { code, password } = resetPasswordDto;
    const user = await this.prismaClient.user.findFirst({
      where: { code },
    });
    if (!user) throw new NotFoundException('User not found');
    if (dayjs().subtract(3, 'hours').isAfter(dayjs(user.resetPasswordExpires)))
      throw new BadRequestException('Code expired');

    try {
      return await this.prismaClient.user.update({
        where: { id: user.id },
        data: {
          password: await this.hashPassword(password),
          code: null,
          resetPasswordExpires: null,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
