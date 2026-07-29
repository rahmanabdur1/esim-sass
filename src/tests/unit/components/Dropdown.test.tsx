import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import '@testing-library/jest-dom';
import { Dropdown, type DropdownOption } from '@/components/ui/Dropdown';

const OPTIONS: DropdownOption[] = [
  { value: 'us', label: 'United States' },
  { value: 'jp', label: 'Japan' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'fr', label: 'France', disabled: true },
];

describe('Dropdown', () => {
  it('renders placeholder when no value is selected', () => {
    render(<Dropdown options={OPTIONS} value={null} onChange={jest.fn()} placeholder="Select a country" />);
    expect(screen.getByText('Select a country')).toBeInTheDocument();
  });

  it('renders the selected option label', () => {
    render(<Dropdown options={OPTIONS} value="jp" onChange={jest.fn()} />);
    expect(screen.getByText('Japan')).toBeInTheDocument();
  });

  it('opens the listbox on trigger click', async () => {
    const user = userEvent.setup();
    render(<Dropdown options={OPTIONS} value={null} onChange={jest.fn()} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(4);
  });

  it('calls onChange and closes when an option is clicked', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    render(<Dropdown options={OPTIONS} value={null} onChange={handleChange} />);
    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Japan'));
    expect(handleChange).toHaveBeenCalledWith('jp');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('does not select a disabled option', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    render(<Dropdown options={OPTIONS} value={null} onChange={handleChange} />);
    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('France'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('marks the disabled option with aria-disabled', async () => {
    const user = userEvent.setup();
    render(<Dropdown options={OPTIONS} value={null} onChange={jest.fn()} />);
    await user.click(screen.getByRole('button'));
    const franceOption = screen.getByText('France').closest('[role="option"]');
    expect(franceOption).toHaveAttribute('aria-disabled', 'true');
  });

  it('marks the selected option with aria-selected', async () => {
    const user = userEvent.setup();
    render(<Dropdown options={OPTIONS} value="us" onChange={jest.fn()} />);
    await user.click(screen.getByRole('button'));
    const usOption = screen.getByText('United States').closest('[role="option"]');
    expect(usOption).toHaveAttribute('aria-selected', 'true');
  });

  it('opens with ArrowDown and selects with Enter', () => {
    const handleChange = jest.fn();
    render(<Dropdown options={OPTIONS} value={null} onChange={handleChange} />);
    const trigger = screen.getByRole('button');
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(handleChange).toHaveBeenCalledWith('us'); // first option
  });

  it('closes on Escape and returns focus to trigger', () => {
    render(<Dropdown options={OPTIONS} value={null} onChange={jest.fn()} />);
    const trigger = screen.getByRole('button');
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('shows an error message and sets aria-invalid', () => {
    render(<Dropdown options={OPTIONS} value={null} onChange={jest.fn()} error="Please select a country" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Please select a country');
  });

  it('respects the disabled prop and does not open', async () => {
    const user = userEvent.setup();
    render(<Dropdown options={OPTIONS} value={null} onChange={jest.fn()} disabled />);
    await user.click(screen.getByRole('button'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('renders an empty state when no options are provided', async () => {
    const user = userEvent.setup();
    render(<Dropdown options={[]} value={null} onChange={jest.fn()} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('No options available')).toBeInTheDocument();
  });

  it('has no accessibility violations when closed', async () => {
    const { container } = render(<Dropdown options={OPTIONS} value="jp" onChange={jest.fn()} label="Country" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations when open', async () => {
    const user = userEvent.setup();
    const { container } = render(<Dropdown options={OPTIONS} value="jp" onChange={jest.fn()} label="Country" />);
    await user.click(screen.getByRole('button'));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
