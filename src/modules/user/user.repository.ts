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
import { IUserRepository } from './Iuser.repository';

export class UserRepository implements IUserRepository {
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

  async getUserById(id: string): Promise<User> {
    await this.prismaClient.$connect();
    const user = (await this.prismaClient.user.findUnique({
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
    })) as User;
    if (!user) {
      await this.prismaClient.$disconnect();
      throw new NotFoundException('User not found');
    }
    await this.prismaClient.$disconnect();
    return user;
  }

  async getUsers(query: FindUsersQueryDto): Promise<User[]> {
    await this.prismaClient.$connect();
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
      const query = (await this.prismaClient.user.findMany({
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
      })) as User[];
      const users = formattedUsers(query);
      await this.prismaClient.$disconnect();
      return users;
    } catch (error) {
      await this.prismaClient.$disconnect();
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async createUser(
    createUserDto: CreateUserDto,
    role: UserRole,
  ): Promise<User> {
    await this.prismaClient.$connect();
    const { name, cpf, phone, email, password } = createUserDto;
    const userExists = await this.prismaClient.user.findMany({
      where: { OR: [{ cpf }, { email }] },
    });
    if (userExists.length > 0) {
      await this.prismaClient.$disconnect();
      throw new ConflictException('Email/CPF already exists');
    }
    try {
      const response = await this.prismaClient.user.create({
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
      await this.prismaClient.$disconnect();
      return response;
    } catch (error) {
      await this.prismaClient.$disconnect();
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async checkCredentials(
    credentialsDto: CredentialsDto,
  ): Promise<{ token: string; refreshToken: string }> {
    await this.prismaClient.$connect();
    const { email, password } = credentialsDto;
    const user = await this.prismaClient.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
        role: true,
      },
    });
    if (!user) {
      await this.prismaClient.$disconnect();
      throw new NotFoundException('User not found');
    }
    if (!(await this.checkPassword(password, user.password))) {
      await this.prismaClient.$disconnect();
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.role === UserRole.UNREGISTERED) {
      await this.prismaClient.$disconnect();
      throw new UnauthorizedException(
        'An administrator must approve your registration before you can log in',
      );
    }
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
      await this.prismaClient.$disconnect();
      return { token: accessToken, refreshToken };
    } catch (error) {
      await this.prismaClient.$disconnect();
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async refreshToken({
    refreshToken,
  }: RefreshTokenDto): Promise<{ token: string }> {
    await this.prismaClient.$connect();
    this.validateRefreshToken(refreshToken);
    const user = await this.prismaClient.user.findUnique({
      where: { refreshToken },
      select: {
        id: true,
      },
    });
    if (!user) {
      await this.prismaClient.$disconnect();
      throw new NotFoundException('User not found');
    }
    try {
      const accessToken = sign(
        { id: user.id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' },
      );
      await this.prismaClient.$disconnect();
      return { token: accessToken };
    } catch (error) {
      await this.prismaClient.$disconnect();
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async approveUser(userId: string): Promise<{ message: string }> {
    await this.prismaClient.$connect();
    const user = await this.prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
      },
    });
    if (!user) {
      await this.prismaClient.$disconnect();
      throw new NotFoundException('User not found');
    }
    if (user.role != UserRole.UNREGISTERED) {
      await this.prismaClient.$disconnect();
      return { message: 'User already approved' };
    }

    try {
      await this.prismaClient.user.update({
        where: { id: userId },
        data: { role: UserRole.NORMAL_USER },
      });
      await this.prismaClient.$disconnect();
      return { message: 'User approved' };
    } catch (error) {
      await this.prismaClient.$disconnect();
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async updateUser(user: User, updateUserDto: UpdateUserDto): Promise<User> {
    await this.prismaClient.$connect();
    const { name, cpf, phone, password } = updateUserDto;
    const userExists = await this.prismaClient.user.findUnique({
      where: { id: user.id },
    });
    if (!userExists) {
      await this.prismaClient.$disconnect();
      throw new NotFoundException('User not found');
    }

    if (!(await this.checkPassword(password, userExists.password))) {
      await this.prismaClient.$disconnect();
      throw new UnauthorizedException('Invalid credentials');
    }

    try {
      const response = (await this.prismaClient.user.update({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          cpf: true,
          role: true,
        },
        data: {
          name: name ? name : userExists.name,
          cpf: cpf ? formatCpf(cpf) : userExists.cpf,
          phone: phone ? formatPhone(phone) : userExists.phone,
        },
      })) as User;
      await this.prismaClient.$disconnect();
      return response;
    } catch (error) {
      await this.prismaClient.$disconnect();
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async changePassword(
    user: User,
    changePasswordDto: ChangePasswordDto,
  ): Promise<User> {
    await this.prismaClient.$connect();
    const { password, newPassword } = changePasswordDto;
    const userExists = await this.prismaClient.user.findUnique({
      where: { id: user.id },
    });
    if (!userExists) {
      await this.prismaClient.$disconnect();
      throw new NotFoundException('User not found');
    }
    if (!(await this.checkPassword(password, userExists.password))) {
      await this.prismaClient.$disconnect();
      throw new UnauthorizedException('Invalid credentials');
    }

    try {
      const response = (await this.prismaClient.user.update({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          cpf: true,
          role: true,
        },
        data: {
          password: await this.hashPassword(newPassword),
        },
      })) as User;
      await this.prismaClient.$disconnect();
      return response;
    } catch (error) {
      await this.prismaClient.$disconnect();
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async deleteUser(
    user: User,
    deleteUserDto: DeleteUserDto,
  ): Promise<{ message: string }> {
    await this.prismaClient.$connect();
    const { password } = deleteUserDto;
    const userExists = await this.prismaClient.user.findUnique({
      where: { id: user.id },
    });
    if (!userExists) {
      await this.prismaClient.$disconnect();
      throw new NotFoundException('User not found');
    }
    if (!(await this.checkPassword(password, userExists.password))) {
      await this.prismaClient.$disconnect();
      throw new UnauthorizedException('Invalid credentials');
    }

    try {
      await this.prismaClient.user.delete({ where: { id: user.id } });
      await this.prismaClient.$disconnect();
      return { message: 'User deleted' };
    } catch (error) {
      await this.prismaClient.$disconnect();
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
    code: string,
  ): Promise<{ message: string }> {
    await this.prismaClient.$connect();
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
      await this.prismaClient.$disconnect();
      return { message: 'Code generated successfully' };
    } catch (error) {
      await this.prismaClient.$disconnect();
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async findUserByEmail(email: string): Promise<User> {
    await this.prismaClient.$connect();
    const user = await this.prismaClient.user.findUnique({
      where: { email },
    });
    if (!user) {
      await this.prismaClient.$disconnect();
      throw new NotFoundException('User not found');
    }
    await this.prismaClient.$disconnect();
    return user;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<User> {
    await this.prismaClient.$connect();
    const { code, password } = resetPasswordDto;
    const user = await this.prismaClient.user.findFirst({
      where: { code },
    });
    if (!user) {
      await this.prismaClient.$disconnect();
      throw new NotFoundException('User not found');
    }
    if (
      dayjs().subtract(3, 'hours').isAfter(dayjs(user.resetPasswordExpires))
    ) {
      await this.prismaClient.$disconnect();
      throw new BadRequestException('Code expired');
    }
    try {
      const response = await this.prismaClient.user.update({
        where: { id: user.id },
        data: {
          password: await this.hashPassword(password),
          code: null,
          resetPasswordExpires: null,
        },
      });
      await this.prismaClient.$disconnect();
      return response;
    } catch (error) {
      await this.prismaClient.$disconnect();
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
