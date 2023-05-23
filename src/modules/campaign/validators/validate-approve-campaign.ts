import { z } from 'zod';
import { ApproveRequestDto } from '../dto/approve-request.dto';

export const validateApproveInterest = (body: ApproveRequestDto) => {
  const Request = z.object({
    status: z.boolean(),
  });
  return Request.safeParse(body);
};
