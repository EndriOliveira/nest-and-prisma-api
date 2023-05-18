import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserRepository } from './modules/user/user.repository';
import { FileModule } from './modules/file/file.module';
import { CampaignModule } from './modules/campaign/campaign.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './modules/auth/middleware/jwt.strategy';
import { SendgridService } from './modules/sendgrid/sendgrid.service';
import { SendgridModule } from './modules/sendgrid/sendgrid.module';

@Module({
  imports: [UserModule, AuthModule, FileModule, CampaignModule, SendgridModule],
  controllers: [AppController],
  providers: [UserRepository, PassportModule, JwtStrategy, SendgridService],
})
export class AppModule {}
