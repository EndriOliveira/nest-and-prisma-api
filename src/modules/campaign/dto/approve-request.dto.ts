import { ApiProperty } from '@nestjs/swagger';

export class ApproveRequestDto {
  @ApiProperty()
  status: boolean;
}
