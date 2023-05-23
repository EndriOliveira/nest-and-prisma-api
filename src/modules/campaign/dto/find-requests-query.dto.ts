import { ApiProperty } from '@nestjs/swagger';
import { BaseQueryParametersDto } from '../../../shared/dto/base-query-parameters.dto';

export class FindRequestsQueryDto extends BaseQueryParametersDto {
  @ApiProperty()
  status: string;
}
