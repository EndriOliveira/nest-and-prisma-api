import { BaseQueryParametersDto } from '../../../shared/dto/base-query-parameters.dto';

export class FindRequestsQueryDto extends BaseQueryParametersDto {
  status: string;
}
