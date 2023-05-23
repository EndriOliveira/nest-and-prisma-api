import { ApiProperty } from '@nestjs/swagger';

export class CreateCampaignDto {
  @ApiProperty()
  title: string;
}
