import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import '@testing-library/jest-dom';
import { Badge, Avatar, Progress, Spinner, Skeleton } from '@/components/atoms/index';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies variant-specific classes', () => {
    render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success').className).toContain('bg-green-100');
  });

  it('renders all variants without crashing', () => {
    const variants = ['default', 'secondary', 'destructive', 'outline', 'success', 'warning', 'info'] as const;
    variants.forEach((v) => {
      const { unmount } = render(<Badge variant={v}>{v}</Badge>);
      expect(screen.getByText(v)).toBeInTheDocument();
      unmount();
    });
  });
});

describe('Avatar', () => {
  it('renders initials when no src is provided', () => {
    render(<Avatar alt="John Doe" name="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders single initial for one-word names', () => {
    render(<Avatar alt="Madonna" name="Madonna" />);
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('renders an image when src is provided', () => {
    render(<Avatar src="/avatar.jpg" alt="User avatar" name="Jane Smith" />);
    const img = screen.getByAltText('User avatar');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/avatar.jpg');
  });

  it('falls back to "?" when no name is provided', () => {
    render(<Avatar alt="Unknown user" />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('applies the correct size classes', () => {
    const { container } = render(<Avatar alt="Test" name="Test User" size="lg" />);
    expect(container.firstChild).toHaveClass('h-12', 'w-12');
  });
});

describe('Progress', () => {
  it('renders with correct ARIA attributes', () => {
    render(<Progress value={42} max={100} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '42');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('clamps value within 0-100%', () => {
    const { container: over }  = render(<Progress value={150} max={100} />);
    const { container: under } = render(<Progress value={-20} max={100} />);
    const overBar  = over.querySelector('[style]') as HTMLElement;
    const underBar = under.querySelector('[style]') as HTMLElement;
    expect(overBar.style.width).toBe('100%');
    expect(underBar.style.width).toBe('0%');
  });

  it('shows percentage label when showLabel is true', () => {
    render(<Progress value={75} max={100} showLabel />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('does not show label by default', () => {
    render(<Progress value={75} max={100} />);
    expect(screen.queryByText('75%')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Progress value={60} max={100} showLabel />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Spinner', () => {
  it('renders with accessible label', () => {
    render(<Spinner label="Loading plans" />);
    expect(screen.getByRole('status', { name: 'Loading plans' })).toBeInTheDocument();
  });

  it('has screen-reader-only text', () => {
    render(<Spinner label="Loading" />);
    expect(screen.getByText('Loading')).toHaveClass('sr-only');
  });
});

describe('Skeleton', () => {
  it('renders a pulse placeholder div', () => {
    const { container } = render(<Skeleton className="h-4 w-32" />);
    expect(container.firstChild).toHaveClass('animate-pulse');
  });
});
