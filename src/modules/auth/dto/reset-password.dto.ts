import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty()
  code: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  confirmPassword: string;
}
