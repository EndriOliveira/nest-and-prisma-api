import { ApiProperty } from '@nestjs/swagger';

export abstract class BaseQueryParametersDto {
  @ApiProperty()
  sort: string;
  @ApiProperty()
  page: number;
  @ApiProperty()
  limit: number;
}
