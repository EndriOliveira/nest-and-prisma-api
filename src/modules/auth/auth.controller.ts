import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { CredentialsDto } from './dto/credentials.dto';
import { GetUser } from './decorator/get-user.decorator';
import { User } from '@prisma/client';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Role } from './decorator/role.decorator';
import { RolesGuard } from './guard/roles.guard';
import { UserRole } from '../user/enum/user-roles.enum';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { formatDate } from '../../utils/utils';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  @ApiBody({ type: CreateUserDto })
  async signUp(@Body() createUserDto: CreateUserDto) {
    return await this.authService.createUser(
      createUserDto,
      UserRole.UNREGISTERED,
    );
  }

  @Post('/signin')
  @ApiBody({ type: CredentialsDto })
  async signIn(@Body() credentialsBody: CredentialsDto) {
    return await this.authService.signIn(credentialsBody);
  }

  @Post('/create-admin')
  @UseGuards(AuthGuard(), RolesGuard)
  @Role(UserRole.SUPER_USER)
  @ApiBody({ type: CreateUserDto })
  @ApiBearerAuth()
  async createAdmin(@Body() createAdminDto: CreateUserDto) {
    return await this.authService.createUser(
      createAdminDto,
      UserRole.ADMIN_USER,
    );
  }

  @Post('/refresh')
  @ApiBody({ type: RefreshTokenDto })
  async refreshToken(@Body() refreshToken: RefreshTokenDto) {
    return await this.authService.refreshToken(refreshToken);
  }

  @Get('/me')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  async getMe(@GetUser() user: User) {
    return {
      ...user,
      createdAt: formatDate(user.createdAt),
    };
  }

  @Put('/change-password')
  @UseGuards(AuthGuard())
  @ApiBody({ type: ChangePasswordDto })
  @ApiBearerAuth()
  async changePassword(
    @GetUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(user, changePasswordDto);
  }

  @Post('/forgot-password')
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('/reset-password')
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }
}
