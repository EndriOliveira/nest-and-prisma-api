import { ApiProperty } from '@nestjs/swagger';

export class EditCampaignDto {
  @ApiProperty()
  title: string;
}
