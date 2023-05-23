import { ApiProperty } from '@nestjs/swagger';
import { BaseQueryParametersDto } from '../../../shared/dto/base-query-parameters.dto';

export class FindUsersQueryDto extends BaseQueryParametersDto {
  @ApiProperty()
  name?: string;
  @ApiProperty()
  email?: string;
  @ApiProperty()
  role?: string;
}
