import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
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

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return await this.authService.createUser(
      createUserDto,
      UserRole.UNREGISTERED,
    );
  }

  @Post('/signin')
  async signIn(@Body() credentialsBody: CredentialsDto) {
    return await this.authService.signIn(credentialsBody);
  }

  @Post('/create-admin')
  @UseGuards(AuthGuard(), RolesGuard)
  @Role(UserRole.SUPER_USER)
  async createAdmin(@Body() createAdminDto: CreateUserDto) {
    return await this.authService.createUser(
      createAdminDto,
      UserRole.ADMIN_USER,
    );
  }

  @Post('/refresh')
  async refreshToken(@Body() refreshToken: RefreshTokenDto) {
    return await this.authService.refreshToken(refreshToken);
  }

  @Get('/me')
  @UseGuards(AuthGuard())
  async getMe(@GetUser() user: User): Promise<User> {
    return user;
  }
}
