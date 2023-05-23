import { validateDeleteCampaignUser } from '../validate-delete-campaign-user';

describe('Validate Delete Campaign User', () => {
  it('should return true', () => {
    const response = validateDeleteCampaignUser({ userId: 'userId' });
    expect(response.success).toBe(true);
  });

  it('should return false', () => {
    const response = validateDeleteCampaignUser({ userId: null });
    expect(response.success).toBe(false);
  });
});
