import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserRepository } from './modules/user/user.repository';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [AppController],
  providers: [UserRepository],
})
export class AppModule {}
