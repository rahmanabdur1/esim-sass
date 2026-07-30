import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { DataTable } from '@/components/data-table/DataTable';

type Row = { id: string; name: string; email: string; status: string; amount: number };

const MOCK_DATA: Row[] = [
  { id: '1', name: 'Japan 5GB', email: 'user1@test.com', status: 'active', amount: 8.99 },
  { id: '2', name: 'USA 10GB', email: 'user2@test.com', status: 'expired', amount: 12.99 },
  { id: '3', name: 'UK 3GB', email: 'user3@test.com', status: 'active', amount: 5.99 },
  { id: '4', name: 'France 5GB', email: 'user4@test.com', status: 'pending', amount: 6.99 },
  { id: '5', name: 'Germany 8GB', email: 'user5@test.com', status: 'active', amount: 9.99 },
];

const COLUMNS = [
  { key: 'name', header: 'Plan', sortable: true, getValue: (r: Row) => r.name },
  { key: 'email', header: 'Email', sortable: false },
  { key: 'status', header: 'Status', sortable: true, getValue: (r: Row) => r.status },
  {
    key: 'amount',
    header: 'Price',
    sortable: true,
    getValue: (r: Row) => r.amount,
    align: 'right' as const,
  },
];

describe('DataTable', () => {
  it('renders all rows', () => {
    render(<DataTable data={MOCK_DATA} columns={COLUMNS} aria-label="Test table" />);
    MOCK_DATA.forEach((row) => {
      expect(screen.getByText(row.name)).toBeInTheDocument();
    });
  });

  it('renders column headers', () => {
    render(<DataTable data={MOCK_DATA} columns={COLUMNS} aria-label="Test table" />);
    expect(screen.getByText('Plan')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
  });

  it('filters data by search query', async () => {
    const user = userEvent.setup();
    render(<DataTable data={MOCK_DATA} columns={COLUMNS} searchable aria-label="Test table" />);

    const input = screen.getByRole('searchbox');
    await user.type(input, 'Japan');

    expect(screen.getByText('Japan 5GB')).toBeInTheDocument();
    expect(screen.queryByText('USA 10GB')).not.toBeInTheDocument();
  });

  it('shows no results message when search yields nothing', async () => {
    const user = userEvent.setup();
    render(<DataTable data={MOCK_DATA} columns={COLUMNS} searchable aria-label="Test table" />);

    await user.type(screen.getByRole('searchbox'), 'xyznonexistent');
    expect(screen.getByText(/no results/i)).toBeInTheDocument();
  });

  it('clears search when X button clicked', async () => {
    const user = userEvent.setup();
    render(<DataTable data={MOCK_DATA} columns={COLUMNS} searchable aria-label="Test table" />);

    await user.type(screen.getByRole('searchbox'), 'Japan');
    expect(screen.queryByText('USA 10GB')).not.toBeInTheDocument();

    const clearBtn = screen.getByLabelText('Clear search');
    await user.click(clearBtn);
    expect(screen.getByText('USA 10GB')).toBeInTheDocument();
  });

  it('shows empty message when data is empty', () => {
    render(
      <DataTable data={[]} columns={COLUMNS} emptyMessage="No records" aria-label="Test table" />,
    );
    expect(screen.getByText('No records')).toBeInTheDocument();
  });

  it('shows loading skeleton when isLoading is true', () => {
    render(<DataTable data={[]} columns={COLUMNS} isLoading aria-label="Test table" />);
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('calls onRowClick when row is clicked', async () => {
    const handler = jest.fn();
    const user = userEvent.setup();
    render(
      <DataTable data={MOCK_DATA} columns={COLUMNS} onRowClick={handler} aria-label="Test table" />,
    );

    const firstRow = screen.getAllByRole('button')[0]!;
    await user.click(firstRow);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(MOCK_DATA[0]);
  });

  it('shows pagination when data exceeds pageSize', () => {
    const largeData = Array.from({ length: 25 }, (_, i) => ({
      id: String(i),
      name: `Plan ${i}`,
      email: `user${i}@t.com`,
      status: 'active',
      amount: 9.99,
    }));
    render(<DataTable data={largeData} columns={COLUMNS} pageSize={10} aria-label="Test table" />);
    expect(screen.getByLabelText('Table pagination')).toBeInTheDocument();
  });

  it('does not show pagination with fewer rows than pageSize', () => {
    render(<DataTable data={MOCK_DATA} columns={COLUMNS} pageSize={10} aria-label="Test table" />);
    expect(screen.queryByLabelText('Table pagination')).not.toBeInTheDocument();
  });

  it('exports CSV when export button clicked', async () => {
    const user = userEvent.setup();
    // Mock URL.createObjectURL and anchor click
    global.URL.createObjectURL = jest.fn(() => 'blob:mock');
    global.URL.revokeObjectURL = jest.fn();
    const createEl = jest.spyOn(document, 'createElement');
    const mockAnchor = { href: '', download: '', click: jest.fn() };
    createEl.mockReturnValueOnce(mockAnchor as unknown as HTMLElement);

    render(
      <DataTable
        data={MOCK_DATA}
        columns={COLUMNS}
        exportable
        exportFilename="test"
        aria-label="Test table"
      />,
    );
    const exportBtn = screen.getByText(/export csv/i);
    await user.click(exportBtn);

    expect(mockAnchor.click).toHaveBeenCalled();
    expect(mockAnchor.download).toBe('test.csv');
    createEl.mockRestore();
  });

  it('has accessible sort buttons with aria-sort', () => {
    render(<DataTable data={MOCK_DATA} columns={COLUMNS} aria-label="Test table" />);
    const planHeader = screen.getByText('Plan').closest('th');
    expect(planHeader).toHaveAttribute('aria-sort', 'none');
  });
});
