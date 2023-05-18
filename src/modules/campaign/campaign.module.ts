import { Module } from '@nestjs/common';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { CampaignRepository } from './campaign.repository';
import { PassportModule } from '@nestjs/passport';
import { FileRepository } from '../file/file.repository';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [CampaignController],
  providers: [CampaignService, CampaignRepository, FileRepository],
})
export class CampaignModule {}
