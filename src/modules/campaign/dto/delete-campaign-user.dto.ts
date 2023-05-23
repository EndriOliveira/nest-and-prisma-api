import { ApiProperty } from '@nestjs/swagger';

export class DeleteCampaignUserDto {
  @ApiProperty()
  userId: string;
}
