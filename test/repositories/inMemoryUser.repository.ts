import { User } from '@prisma/client';
import { genSalt, hash, compare } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { v4 as uuidV4 } from 'uuid';
import {
  UnauthorizedException,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ChangePasswordDto } from '../../src/modules/auth/dto/change-password.dto';
import { CredentialsDto } from '../../src/modules/auth/dto/credentials.dto';
import { ForgotPasswordDto } from '../../src/modules/auth/dto/forgot-password.dto';
import { RefreshTokenDto } from '../../src/modules/auth/dto/refresh-token.dto';
import { ResetPasswordDto } from '../../src/modules/auth/dto/reset-password.dto';
import { CreateUserDto } from '../../src/modules/user/dto/create-user.dto';
import { DeleteUserDto } from '../../src/modules/user/dto/delete-user.dto';
import { FindUsersQueryDto } from '../../src/modules/user/dto/find-users-query.dto';
import { UpdateUserDto } from '../../src/modules/user/dto/update-user.dto';
import { UserRole } from '../../src/modules/user/enum/user-roles.enum';
import { IUserRepository } from '../../src/modules/user/Iuser.repository';
import { formatCpf, formatDate, formatPhone } from '../../src/utils/utils';

export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [
    {
      id: '5484206c-cd06-4e24-a2ba-8561b1b1e1c3',
      name: 'Test User',
      email: 'user.test@example.com',
      cpf: '727.550.440-55',
      password: '$2a$12$nPLMBUSBxMz4q7sx6ruzfuDAG0lUdxETmWYzUmcZr8MDWmLuUvReG',
      createdAt: new Date(),
      updatedAt: new Date(),
      phone: '(11) 95621-1234',
      code: null,
      refreshToken: null,
      resetPasswordExpires: null,
      role: UserRole.UNREGISTERED,
    },
    {
      id: '3f3004f5-652c-4ce5-9d55-44585153f3ce',
      name: 'Test User Secondary',
      email: 'user.test02@example.com',
      cpf: '372.831.320-31',
      password: '$2a$12$nPLMBUSBxMz4q7sx6ruzfuDAG0lUdxETmWYzUmcZr8MDWmLuUvReG',
      createdAt: new Date(),
      updatedAt: new Date(),
      phone: '(11) 95221-4534',
      code: null,
      refreshToken: null,
      resetPasswordExpires: null,
      role: UserRole.NORMAL_USER,
    },
  ];

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
      return verify(
        refreshToken,
        'UJ66kR4e0tFtZhSWEKVxA53MAZUk4Qtg59s3APwQkbSklIJFiT',
      );
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getUserById(id: string): Promise<User> {
    const user = this.users.find((user) => user.id === id);
    if (!user) throw new NotFoundException('User not found');
    return Promise.resolve(user);
  }

  async getUsers(query: FindUsersQueryDto): Promise<any> {
    let { name, email, role } = query;
    name = name ? name.trim() : '';
    email = email ? email.trim() : '';
    role = role ? role.trim() : '';

    const users = this.users.filter((user) => {
      const nameCondition = user.name
        .toLowerCase()
        .includes(name.toLowerCase());
      const emailCondition = user.email
        .toLowerCase()
        .includes(email.toLowerCase());
      const roleCondition = user.role
        .toLowerCase()
        .includes(role.toLowerCase());
      return nameCondition && emailCondition && roleCondition;
    });

    return Promise.resolve(
      users.map((user) => ({
        id: user?.id,
        name: user?.name,
        cpf: user?.cpf,
        phone: user?.phone,
        email: user?.email,
        role: user?.role,
        createdAt: formatDate(user?.createdAt),
      })),
    );
  }

  async createUser(
    createUserDto: CreateUserDto,
    role: UserRole,
  ): Promise<User> {
    const { name, cpf, phone, email, password } = createUserDto;
    const userExists = this.users.find(
      (user) => user.email === email || user.cpf === cpf,
    );
    if (userExists) throw new ConflictException('User already exists');

    const user: User = {
      id: uuidV4(),
      name,
      cpf: formatCpf(cpf),
      phone: formatPhone(phone),
      email,
      password: await this.hashPassword(password),
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      code: null,
      refreshToken: null,
      resetPasswordExpires: null,
    };

    this.users.push(user);
    return Promise.resolve(user);
  }

  async checkCredentials(
    credentialsDto: CredentialsDto,
  ): Promise<{ token: string; refreshToken: string }> {
    const { email, password } = credentialsDto;
    let user = this.users.find((user) => user.email === email);
    if (!user) throw new NotFoundException('User not found');
    if (!(await this.checkPassword(password, user.password)))
      throw new UnauthorizedException('Invalid credentials');
    if (user.role === UserRole.UNREGISTERED)
      throw new UnauthorizedException(
        'An administrator must approve your registration before you can log in',
      );

    const accessToken = sign(
      { id: user.id },
      'C1HmB1ZaPqjJzuUwKT5GRA8Y3bqUQ2YVDUor2tSbLH7aPOzzq6',
      {
        expiresIn: '1h',
      },
    );
    const refreshToken = sign(
      { id: user.id },
      'UJ66kR4e0tFtZhSWEKVxA53MAZUk4Qtg59s3APwQkbSklIJFiT',
      { expiresIn: '1d' },
    );
    user = {
      ...user,
      refreshToken,
    };
    return Promise.resolve({ token: accessToken, refreshToken });
  }

  async refreshToken({
    refreshToken,
  }: RefreshTokenDto): Promise<{ token: string }> {
    console.log(this.users);

    this.validateRefreshToken(refreshToken);
    const user = this.users.find((user) => user.refreshToken === refreshToken);
    if (!user) throw new NotFoundException('User not found');
    const accessToken = sign(
      { id: user.id },
      'C1HmB1ZaPqjJzuUwKT5GRA8Y3bqUQ2YVDUor2tSbLH7aPOzzq6',
      {
        expiresIn: '1h',
      },
    );
    return Promise.resolve({ token: accessToken });
  }

  async approveUser(userId: string): Promise<{ message: string }> {
    const user = this.users.find((user) => user.id === userId);
    if (!user) throw new NotFoundException('User not found');
    if (user.role != UserRole.UNREGISTERED)
      return { message: 'User already approved' };
    user.role = UserRole.NORMAL_USER;
    return Promise.resolve({ message: 'User approved' });
  }

  async updateUser(user: User, updateUserDto: UpdateUserDto): Promise<User> {
    const { name, cpf, phone, password } = updateUserDto;
    const userExists = this.users.find((user1) => user1.id === user.id);
    if (!userExists) throw new NotFoundException('User not found');
    if (!(await this.checkPassword(password, userExists.password)))
      throw new UnauthorizedException('Invalid credentials');

    userExists.name = name ? name : userExists.name;
    userExists.cpf = cpf ? formatCpf(cpf) : userExists.cpf;
    userExists.phone = phone ? formatPhone(phone) : userExists.phone;

    return Promise.resolve(userExists);
  }

  async changePassword(
    user: User,
    changePasswordDto: ChangePasswordDto,
  ): Promise<User> {
    const { password, newPassword } = changePasswordDto;
    const userExists = this.users.find((user1) => user1.id === user.id);
    if (!userExists) throw new NotFoundException('User not found');
    if (!(await this.checkPassword(password, userExists.password)))
      throw new UnauthorizedException('Invalid credentials');

    userExists.password = await this.hashPassword(newPassword);
    return Promise.resolve(userExists);
  }

  async deleteUser(
    user: User,
    deleteUserDto: DeleteUserDto,
  ): Promise<{ message: string }> {
    const { password } = deleteUserDto;
    const userExists = this.users.find((user1) => user1.id === user.id);
    if (!userExists) throw new NotFoundException('User not found');
    if (!(await this.checkPassword(password, userExists.password)))
      throw new UnauthorizedException('Invalid credentials');

    this.users = this.users.filter((user1) => user1.id !== user.id);
    return Promise.resolve({ message: 'User deleted' });
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
    code: string,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;
    const user = this.users.find((user) => user.email === email);
    user.code = code;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    return Promise.resolve({ message: 'Code generated successfully' });
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = this.users.find((user) => user.email === email);
    if (!user) throw new NotFoundException('User not found');
    return Promise.resolve(user);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<User> {
    const { code, password } = resetPasswordDto;
    const user = this.users.find((user) => user.code === code);
    if (!user) throw new NotFoundException('User not found');
    if (user.resetPasswordExpires < new Date(Date.now()))
      throw new BadRequestException('Code expired');

    user.password = await this.hashPassword(password);
    user.code = null;
    user.resetPasswordExpires = null;
    return Promise.resolve(user);
  }
}
