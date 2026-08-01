import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import '@testing-library/jest-dom';
import { SearchBar } from '@/components/molecules/SearchBar';

describe('SearchBar', () => {
  it('renders with placeholder text', () => {
    render(<SearchBar value="" onChange={() => {}} placeholder="Search plans..." />);
    expect(screen.getByPlaceholderText('Search plans...')).toBeInTheDocument();
  });

  it('displays the current value', () => {
    render(<SearchBar value="Japan" onChange={() => {}} />);
    expect(screen.getByDisplayValue('Japan')).toBeInTheDocument();
  });

  it('calls onChange when typing', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    render(<SearchBar value="" onChange={handleChange} aria-label="Search" />);
    await user.type(screen.getByRole('searchbox'), 'a');
    expect(handleChange).toHaveBeenCalledWith('a');
  });

  it('shows a clear button only when value is non-empty', () => {
    const { rerender } = render(<SearchBar value="" onChange={() => {}} />);
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();

    rerender(<SearchBar value="Japan" onChange={() => {}} />);
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('clears value and calls onClear when clear button clicked', async () => {
    const handleChange = jest.fn();
    const handleClear = jest.fn();
    const user = userEvent.setup();
    render(<SearchBar value="Japan" onChange={handleChange} onClear={handleClear} />);
    await user.click(screen.getByLabelText('Clear search'));
    expect(handleChange).toHaveBeenCalledWith('');
    expect(handleClear).toHaveBeenCalled();
  });

  it('shows loading spinner instead of search icon when isLoading', () => {
    const { container } = render(<SearchBar value="" onChange={() => {}} isLoading />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('autofocuses the input when autoFocus is true', () => {
    render(<SearchBar value="" onChange={() => {}} autoFocus aria-label="Search" />);
    expect(screen.getByRole('searchbox')).toHaveFocus();
  });

  it('uses a custom aria-label when provided', () => {
    render(<SearchBar value="" onChange={() => {}} aria-label="Search support tickets" />);
    expect(screen.getByLabelText('Search support tickets')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <SearchBar value="test" onChange={() => {}} aria-label="Search plans" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
