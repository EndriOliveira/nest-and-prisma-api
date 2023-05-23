import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty()
  name?: string;
  @ApiProperty()
  cpf?: string;
  @ApiProperty()
  phone?: string;
  @ApiProperty()
  password: string;
}
