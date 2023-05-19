import { Test, TestingModule } from '@nestjs/testing';
import { CampaignService } from './campaign.service';
import { PassportModule } from '@nestjs/passport';
import { CampaignController } from './campaign.controller';
import { CampaignRepository } from './campaign.repository';
import { FileRepository } from '../file/file.repository';

describe('CampaignService', () => {
  let service: CampaignService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [CampaignController],
      providers: [CampaignService, CampaignRepository, FileRepository],
    }).compile();

    service = module.get<CampaignService>(CampaignService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
