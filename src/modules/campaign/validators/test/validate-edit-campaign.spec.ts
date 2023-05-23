import { validateEditCampaign } from '../validate-edit-campaign';

describe('Validate Edit Campaign', () => {
  it('should return true', () => {
    const response = validateEditCampaign({ title: 'Test Title' });
    expect(response.success).toBe(true);
  });

  it('should return false', () => {
    const response = validateEditCampaign({ title: null });
    expect(response.success).toBe(false);
  });
});
