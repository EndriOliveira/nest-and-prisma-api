import { validateApproveInterest } from '../validate-approve-campaign';

describe('Validate Approve Interest', () => {
  it('should return true', () => {
    let response = validateApproveInterest({ status: false });
    expect(response.success).toBe(true);
    response = validateApproveInterest({ status: true });
    expect(response.success).toBe(true);
  });

  it('should return false', () => {
    const response = validateApproveInterest({ status: null });
    expect(response.success).toBe(false);
  });
});
