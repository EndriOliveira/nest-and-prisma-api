import { User } from '@prisma/client';
import { UserRole } from './enum/user-roles.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { CredentialsDto } from '../auth/dto/credentials.dto';
import { RefreshTokenDto } from '../auth/dto/refresh-token.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from '../auth/dto/change-password.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { ForgotPasswordDto } from '../auth/dto/forgot-password.dto';
import { ResetPasswordDto } from '../auth/dto/reset-password.dto';

export interface IUserRepository {
  getUserById(id: string): Promise<User>;
  getUsers(query: any): Promise<User[]>;
  createUser(createUserDto: CreateUserDto, role: UserRole): Promise<User>;
  checkCredentials(
    credentialsDto: CredentialsDto,
  ): Promise<{ token: string; refreshToken: string }>;
  refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{ token: string }>;
  approveUser(userId: string): Promise<{ message: string }>;
  updateUser(user: User, updateUserDto: UpdateUserDto): Promise<User>;
  changePassword(
    user: User,
    changePasswordDto: ChangePasswordDto,
  ): Promise<User>;
  deleteUser(
    user: User,
    deleteUserDto: DeleteUserDto,
  ): Promise<{ message: string }>;
  forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
    code: string,
  ): Promise<{ message: string }>;
  findUserByEmail(email: string): Promise<User>;
  resetPassword(resetPasswordDto: ResetPasswordDto): Promise<User>;
}
