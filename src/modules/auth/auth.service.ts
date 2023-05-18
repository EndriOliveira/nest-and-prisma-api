import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { validateCreateUser } from './validators/validate-create-user';
import { validateCPF } from 'src/utils/validate-cpf';
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
import { templateForgetPassword } from 'src/templates/forgetPasswordEmail';
import { generateRandomCode } from 'src/utils/utils';
import { SendgridService } from '../sendgrid/sendgrid.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { validateResetPassword } from './validators/validate-reset-password';
import { templateForgetPasswordSucess } from 'src/templates/forgetPasswordEmailSuccess';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private sendGridService: SendgridService,
  ) {}

  async createUser(createUserDto: CreateUserDto, role: UserRole) {
    try {
      validateCreateUser(createUserDto);
    } catch (error) {
      if (error['name'] === 'ZodError') {
        throw new BadRequestException(error['issues']);
      } else {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }
    const { password, confirmPassword } = createUserDto;
    validateCPF(createUserDto.cpf);
    if (password !== confirmPassword)
      throw new BadRequestException('Passwords do not match');
    return await this.userRepository.createUser(createUserDto, role);
  }

  async signIn(credentialsDto: CredentialsDto) {
    try {
      validateCredentials(credentialsDto);
    } catch (error) {
      if (error['name'] === 'ZodError') {
        throw new BadRequestException(error['issues']);
      } else {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }

    return await this.userRepository.checkCredentials(credentialsDto);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      validateRefreshToken(refreshTokenDto);
    } catch (error) {
      if (error['name'] === 'ZodError') {
        throw new BadRequestException(error['issues']);
      } else {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }
    return await this.userRepository.refreshToken(refreshTokenDto);
  }

  async changePassword(user: User, changePasswordDto: ChangePasswordDto) {
    try {
      validateChangePassword(changePasswordDto);
    } catch (error) {
      if (error['name'] === 'ZodError') {
        throw new BadRequestException(error['issues']);
      } else {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }
    const { newPassword, confirmNewPassword } = changePasswordDto;
    if (newPassword !== confirmNewPassword)
      throw new BadRequestException('Passwords do not match');
    return await this.userRepository.changePassword(user, changePasswordDto);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      validateForgotPassword(forgotPasswordDto);
    } catch (error) {
      if (error['name'] === 'ZodError') {
        throw new BadRequestException(error['issues']);
      } else {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }
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
    try {
      validateResetPassword(resetPasswordDto);
    } catch (error) {
      if (error['name'] === 'ZodError') {
        throw new BadRequestException(error['issues']);
      } else {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }
    const { password, confirmPassword } = resetPasswordDto;
    if (password !== confirmPassword)
      throw new BadRequestException('Passwords do not match');
    const { email, name } = await this.userRepository.resetPassword(
      resetPasswordDto,
    );
    const mail = await templateForgetPasswordSucess({ email, name });
    await this.sendGridService.sendMail(mail);
    return { message: 'Password changed successfully' };
  }
}
