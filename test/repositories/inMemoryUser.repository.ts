import { PrismaClient, User } from '@prisma/client';
import { genSalt, hash, compare } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import {
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ChangePasswordDto } from 'src/modules/auth/dto/change-password.dto';
import { CredentialsDto } from 'src/modules/auth/dto/credentials.dto';
import { ForgotPasswordDto } from 'src/modules/auth/dto/forgot-password.dto';
import { RefreshTokenDto } from 'src/modules/auth/dto/refresh-token.dto';
import { ResetPasswordDto } from 'src/modules/auth/dto/reset-password.dto';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
import { DeleteUserDto } from 'src/modules/user/dto/delete-user.dto';
import { FindUsersQueryDto } from 'src/modules/user/dto/find-users-query.dto';
import { UpdateUserDto } from 'src/modules/user/dto/update-user.dto';
import { UserRole } from 'src/modules/user/enum/user-roles.enum';
import { UserRepository } from 'src/modules/user/user.repository';

export class InMemoryUserRepository implements UserRepository {
  constructor(public prismaClient: PrismaClient = new PrismaClient()) {}

  async hashPassword(password: string): Promise<string> {
    try {
      const salt = await genSalt(10);
      return await hash(password, salt);
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async checkPassword(
    password: string,
    userPassword: string,
  ): Promise<boolean> {
    try {
      return await compare(password, userPassword);
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  validateRefreshToken(refreshToken: string) {
    try {
      return verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  getUserById(id: string): Promise<{
    id: string;
    name: string;
    cpf: string;
    phone: string;
    email: string;
    role: string;
    createdAt: Date;
  }> {
    throw new Error('Method not implemented.');
  }
  getUsers(query: FindUsersQueryDto): Promise<any> {
    throw new Error('Method not implemented.');
  }
  createUser(createUserDto: CreateUserDto, role: UserRole): Promise<User> {
    throw new Error('Method not implemented.');
  }
  checkCredentials(
    credentialsDto: CredentialsDto,
  ): Promise<{ token: string; refreshToken: string }> {
    throw new Error('Method not implemented.');
  }
  refreshToken({ refreshToken }: RefreshTokenDto): Promise<{ token: string }> {
    throw new Error('Method not implemented.');
  }
  approveUser(userId: string): Promise<{ message: string }> {
    throw new Error('Method not implemented.');
  }
  updateUser(user: User, updateUserDto: UpdateUserDto): Promise<User> {
    throw new Error('Method not implemented.');
  }
  changePassword(
    user: User,
    changePasswordDto: ChangePasswordDto,
  ): Promise<User> {
    throw new Error('Method not implemented.');
  }
  deleteUser(
    user: User,
    deleteUserDto: DeleteUserDto,
  ): Promise<{ message: string }> {
    throw new Error('Method not implemented.');
  }
  forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
    code: string,
  ): Promise<{ message: string }> {
    throw new Error('Method not implemented.');
  }
  findUserByEmail(email: string): Promise<User> {
    throw new Error('Method not implemented.');
  }
  resetPassword(resetPasswordDto: ResetPasswordDto): Promise<User> {
    throw new Error('Method not implemented.');
  }
}
