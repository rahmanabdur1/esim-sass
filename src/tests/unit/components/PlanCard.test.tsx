import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import '@testing-library/jest-dom';
import { PlanCard } from '@/components/molecules/PlanCard';
import type { Plan } from '@/types';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/',
}));

const mockPlan: Plan = {
  id: 'plan-1',
  name: 'Japan Explorer',
  data: 10,
  validity: 30,
  price: 8.99,
  currency: 'USD',
  network: 'NTT Docomo',
  coverage: ['JP'],
  features: ['4G/LTE', 'Tethering allowed', 'No throttling'],
  isPopular: true,
  isBestValue: false,
  country: {
    id: 'jp', name: 'Japan', code: 'JP', flag: '🇯🇵',
    region: 'Asia', continent: 'Asia', networks: ['NTT Docomo'], coverageQuality: 'excellent',
  },
};

describe('PlanCard', () => {
  it('renders plan name and country', () => {
    render(<PlanCard plan={mockPlan} />);
    expect(screen.getByText('Japan Explorer')).toBeInTheDocument();
    expect(screen.getByText('Japan')).toBeInTheDocument();
  });

  it('displays formatted data, validity, and network', () => {
    render(<PlanCard plan={mockPlan} />);
    expect(screen.getByText('10 GB')).toBeInTheDocument();
    expect(screen.getByText('1 Month')).toBeInTheDocument();
    expect(screen.getByText('NTT Docomo')).toBeInTheDocument();
  });

  it('displays formatted price', () => {
    render(<PlanCard plan={mockPlan} />);
    expect(screen.getByText('$8.99')).toBeInTheDocument();
  });

  it('shows the Popular badge when isPopular is true', () => {
    render(<PlanCard plan={mockPlan} />);
    expect(screen.getByText('Popular')).toBeInTheDocument();
  });

  it('shows the Best Value badge when isBestValue is true', () => {
    render(<PlanCard plan={{ ...mockPlan, isBestValue: true, isPopular: false }} />);
    expect(screen.getByText('Best Value')).toBeInTheDocument();
  });

  it('renders up to 3 features', () => {
    render(<PlanCard plan={mockPlan} />);
    expect(screen.getByText('4G/LTE')).toBeInTheDocument();
    expect(screen.getByText('Tethering allowed')).toBeInTheDocument();
    expect(screen.getByText('No throttling')).toBeInTheDocument();
  });

  it('calls onSelect with the plan when CTA is clicked', async () => {
    const handleSelect = jest.fn();
    const user = userEvent.setup();
    render(<PlanCard plan={mockPlan} onSelect={handleSelect} />);
    await user.click(screen.getByRole('button', { name: /get this plan/i }));
    expect(handleSelect).toHaveBeenCalledWith(mockPlan);
  });

  it('renders as a link when no onSelect handler is provided', () => {
    render(<PlanCard plan={mockPlan} />);
    expect(screen.getByRole('link', { name: /get this plan/i })).toBeInTheDocument();
  });

  it('has an accessible label describing the plan', () => {
    render(<PlanCard plan={mockPlan} />);
    expect(screen.getByLabelText(/japan explorer plan/i)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<PlanCard plan={mockPlan} onSelect={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
