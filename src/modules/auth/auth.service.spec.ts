import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { UserRepository } from '../user/user.repository';
import { SendgridService } from '../sendgrid/sendgrid.service';
import { UserService } from '../user/user.service';
import { UserController } from '../user/user.controller';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    const authModule: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [AuthController],
      providers: [AuthService, UserRepository, SendgridService],
    }).compile();
    const userModule: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [UserController],
      providers: [UserService, UserRepository],
    }).compile();

    userService = userModule.get<UserService>(UserService);
    authService = authModule.get<AuthService>(AuthService);
  });
});
