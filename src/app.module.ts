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
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerInterceptor } from './interceptor/logger.interceptor';
import { winstonConfig } from './configs/winston.config';
import { WinstonModule } from 'nest-winston';

@Module({
  imports: [
    UserModule,
    AuthModule,
    FileModule,
    CampaignModule,
    SendgridModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    WinstonModule.forRoot(winstonConfig),
  ],
  controllers: [AppController],
  providers: [
    UserRepository,
    PassportModule,
    JwtStrategy,
    SendgridService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
  ],
})
export class AppModule {}
