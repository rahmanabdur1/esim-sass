import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import '@testing-library/jest-dom';
import {
  ActiveESIMWidget,
  ActiveESIMWidgetSkeleton,
} from '@/components/organisms/DashboardWidgets';
import type { ESIM } from '@/types';

jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  MockLink.displayName = 'Link';
  return MockLink;
});

const mockESIM: ESIM = {
  id: 'esim-1',
  iccid: '8901260000000000001',
  label: 'Japan Trip',
  status: 'active',
  dataTotal: 10,
  dataUsed: 4,
  dataRemaining: 6,
  validFrom: '2025-01-01',
  validTo: '2025-01-31',
  country: {
    id: 'jp',
    name: 'Japan',
    code: 'JP',
    flag: '🇯🇵',
    region: 'Asia',
    continent: 'Asia',
    networks: ['NTT Docomo'],
    coverageQuality: 'excellent',
  },
  plan: {
    id: 'plan-1',
    name: 'Japan 10GB',
    data: 10,
    validity: 30,
    price: 8.99,
    currency: 'USD',
    network: 'NTT Docomo',
    coverage: ['JP'],
    features: [],
    country: {
      id: 'jp',
      name: 'Japan',
      code: 'JP',
      flag: '🇯🇵',
      region: 'Asia',
      continent: 'Asia',
      networks: ['NTT Docomo'],
      coverageQuality: 'excellent',
    },
  },
  qrCode: 'data:image/png;base64,xyz',
  network: 'NTT Docomo',
  activationCode: 'LPA:1$rsp.example.com$ABC123',
  createdAt: '2025-01-01',
};

describe('ActiveESIMWidget', () => {
  it('renders the eSIM label and country', () => {
    render(<ActiveESIMWidget esim={mockESIM} />);
    expect(screen.getByText('Japan Trip')).toBeInTheDocument();
    expect(screen.getByText('Japan')).toBeInTheDocument();
  });

  it('shows the active status badge', () => {
    render(<ActiveESIMWidget esim={mockESIM} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('displays remaining and total data', () => {
    render(<ActiveESIMWidget esim={mockESIM} />);
    expect(screen.getByText(/6 GB left of 10 GB/)).toBeInTheDocument();
  });

  it('shows correct usage percentage', () => {
    render(<ActiveESIMWidget esim={mockESIM} />);
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('links to the eSIM details page with the correct id', () => {
    render(<ActiveESIMWidget esim={mockESIM} />);
    const link = screen.getByRole('link', { name: /view details for japan trip/i });
    expect(link).toHaveAttribute('href', expect.stringContaining('esim-1'));
  });

  it('renders expired status with correct styling', () => {
    render(<ActiveESIMWidget esim={{ ...mockESIM, status: 'expired' }} />);
    expect(screen.getByText('Expired')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ActiveESIMWidget esim={mockESIM} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('ActiveESIMWidgetSkeleton', () => {
  it('renders a loading skeleton with accessible label', () => {
    render(<ActiveESIMWidgetSkeleton />);
    expect(screen.getByLabelText('Loading eSIM widget')).toBeInTheDocument();
  });
});
