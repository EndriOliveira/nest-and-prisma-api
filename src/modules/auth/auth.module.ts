import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from '../user/user.repository';
import { PassportModule } from '@nestjs/passport';
import { SendgridService } from '../sendgrid/sendgrid.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, SendgridService],
})
export class AuthModule {}
