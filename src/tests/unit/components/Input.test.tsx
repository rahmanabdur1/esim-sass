import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import 'jest-axe/extend-expect';
import '@testing-library/jest-dom';
import { Input } from '@/components/atoms/index';

describe('Input', () => {
  it('renders with a label', () => {
    render(<Input label="Email address" />);
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
  });

  it('renders placeholder text', () => {
    render(<Input placeholder="you@example.com" />);
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });

  it('shows required asterisk when required prop is set', () => {
    render(<Input label="Name" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays an error message and sets aria-invalid', () => {
    render(<Input label="Email" error="Invalid email address" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email address');
  });

  it('links error message via aria-describedby', () => {
    render(<Input label="Email" error="Invalid email address" />);
    const input = screen.getByLabelText('Email');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)).toHaveTextContent('Invalid email address');
  });

  it('shows a hint when no error is present', () => {
    render(<Input label="Password" hint="Must be 8+ characters" />);
    expect(screen.getByText('Must be 8+ characters')).toBeInTheDocument();
  });

  it('does not show hint when error is present', () => {
    render(<Input label="Password" hint="Must be 8+ characters" error="Too short" />);
    expect(screen.queryByText('Must be 8+ characters')).not.toBeInTheDocument();
    expect(screen.getByText('Too short')).toBeInTheDocument();
  });

  it('renders left and right icons', () => {
    render(
      <Input
        label="Search"
        leftIcon={<span data-testid="left-icon" />}
        rightIcon={<span data-testid="right-icon" />}
      />,
    );
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('calls onChange when typing', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    render(<Input label="Name" onChange={handleChange} />);
    await user.type(screen.getByLabelText('Name'), 'John');
    expect(handleChange).toHaveBeenCalledTimes(4);
  });

  it('respects disabled state', () => {
    render(<Input label="Name" disabled />);
    expect(screen.getByLabelText('Name')).toBeDisabled();
  });

  it('forwards ref to the underlying input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input label="Name" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <form>
        <Input label="Email address" type="email" required />
        <Input label="Password" type="password" hint="Min 8 characters" />
      </form>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations in error state', async () => {
    const { container } = render(<Input label="Email" error="This field is required" required />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
