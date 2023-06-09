import { BadRequestException, Injectable } from '@nestjs/common';
import { validateCreateUser } from './validators/validate-create-user';
import { validateCPF } from '../../utils/validate-cpf';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserRepository } from '../user/user.repository';
import { CredentialsDto } from './dto/credentials.dto';
import { validateCredentials } from './validators/validate-credentials';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { validateRefreshToken } from './validators/validate-refresh-token';
import { UserRole } from '../user/enum/user-roles.enum';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '@prisma/client';
import { validateChangePassword } from './validators/validate-change-password';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { validateForgotPassword } from './validators/validate-forgot-password';
import { templateForgetPassword } from '../../templates/forgetPasswordEmail';
import { generateRandomCode } from '../../utils/utils';
import { SendgridService } from '../sendgrid/sendgrid.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { validateResetPassword } from './validators/validate-reset-password';
import { templateForgetPasswordSuccess } from '../../templates/forgetPasswordEmailSuccess';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private sendGridService: SendgridService,
  ) {}

  async createUser(createUserDto: CreateUserDto, role: UserRole) {
    const validate = validateCreateUser(createUserDto);
    if (!validate['success'])
      throw new BadRequestException(validate['error'].issues);
    const { password, confirmPassword } = createUserDto;
    validateCPF(createUserDto.cpf);
    if (password !== confirmPassword)
      throw new BadRequestException('Passwords do not match');
    return await this.userRepository.createUser(createUserDto, role);
  }

  async signIn(credentialsDto: CredentialsDto) {
    const validate = validateCredentials(credentialsDto);
    if (!validate['success'])
      throw new BadRequestException(validate['error'].issues);
    return await this.userRepository.checkCredentials(credentialsDto);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const validate = validateRefreshToken(refreshTokenDto);
    if (!validate['success'])
      throw new BadRequestException(validate['error'].issues);
    return await this.userRepository.refreshToken(refreshTokenDto);
  }

  async changePassword(user: User, changePasswordDto: ChangePasswordDto) {
    const validate = validateChangePassword(changePasswordDto);
    if (!validate['success'])
      throw new BadRequestException(validate['error'].issues);
    const { newPassword, confirmNewPassword } = changePasswordDto;
    if (newPassword !== confirmNewPassword)
      throw new BadRequestException('Passwords do not match');
    return await this.userRepository.changePassword(user, changePasswordDto);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const validate = validateForgotPassword(forgotPasswordDto);
    if (!validate['success'])
      throw new BadRequestException(validate['error'].issues);
    const { email, name } = await this.userRepository.findUserByEmail(
      forgotPasswordDto.email,
    );
    const code = generateRandomCode(6);
    await this.userRepository.forgotPassword(forgotPasswordDto, code);
    const mail = await templateForgetPassword({ name, code, email });
    await this.sendGridService.sendMail(mail);
    return { message: 'Email sent successfully' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const validate = validateResetPassword(resetPasswordDto);
    if (!validate['success'])
      throw new BadRequestException(validate['error'].issues);
    const { password, confirmPassword } = resetPasswordDto;
    if (password !== confirmPassword)
      throw new BadRequestException('Passwords do not match');
    const { email, name } = await this.userRepository.resetPassword(
      resetPasswordDto,
    );
    const mail = await templateForgetPasswordSuccess({ email, name });
    await this.sendGridService.sendMail(mail);
    return { message: 'Password changed successfully' };
  }
}
