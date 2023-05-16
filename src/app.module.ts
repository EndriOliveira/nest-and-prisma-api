import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserRepository } from './modules/user/user.repository';
import { FileModule } from './modules/file/file.module';
import { CampaignModule } from './modules/campaign/campaign.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './modules/auth/middleware/jwt.strategy';

@Module({
  imports: [UserModule, AuthModule, FileModule, CampaignModule],
  controllers: [AppController],
  providers: [UserRepository, PassportModule, JwtStrategy],
})
export class AppModule {}
