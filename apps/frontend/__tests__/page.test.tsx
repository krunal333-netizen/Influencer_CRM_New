import { render, screen } from '@testing-library/react';
import HomePage from '../app/page';

describe('HomePage', () => {
  it('renders the main heading', () => {
    render(<HomePage />);
    const heading = screen.getByRole('heading', { name: /influencer crm/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<HomePage />);
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    const influencersLink = screen.getByRole('link', { name: /influencers/i });
    const campaignsLink = screen.getByRole('link', { name: /campaigns/i });
    const analyticsLink = screen.getByRole('link', { name: /analytics/i });

    expect(dashboardLink).toBeInTheDocument();
    expect(influencersLink).toBeInTheDocument();
    expect(campaignsLink).toBeInTheDocument();
    expect(analyticsLink).toBeInTheDocument();
  });
});