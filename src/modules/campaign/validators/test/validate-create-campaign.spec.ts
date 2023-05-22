import { validateCreateCampaign } from '../validate-create-campaign';

describe('Validate Create Campaign', () => {
  it('should return true', () => {
    const response = validateCreateCampaign({ title: 'Test Title' });
    expect(response.success).toBe(true);
  });

  it('should return false', () => {
    const response = validateCreateCampaign({ title: null });
    expect(response.success).toBe(false);
  });
});
