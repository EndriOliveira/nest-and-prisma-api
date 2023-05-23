import { ApiProperty } from '@nestjs/swagger';

export class RegisterAdminDto {
  @ApiProperty()
  adminId: string;
}
