import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import '@testing-library/jest-dom';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';

describe('Modal', () => {
  it('does not render when open is false', () => {
    render(
      <Modal open={false} onClose={jest.fn()} title="Test Modal">
        Content
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when open is true', () => {
    render(
      <Modal open onClose={jest.fn()} title="Test Modal">
        Content
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders the description when provided', () => {
    render(
      <Modal open onClose={jest.fn()} title="Title" description="Helpful description">
        Body
      </Modal>,
    );
    expect(screen.getByText('Helpful description')).toBeInTheDocument();
  });

  it('links title and description via aria attributes', () => {
    render(
      <Modal open onClose={jest.fn()} title="Title" description="Desc">
        Body
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'modal-desc');
  });

  it('calls onClose when the close button is clicked', async () => {
    const handleClose = jest.fn();
    const user = userEvent.setup();
    render(
      <Modal open onClose={handleClose} title="Test">
        Content
      </Modal>,
    );
    await user.click(screen.getByLabelText('Close dialog'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const handleClose = jest.fn();
    render(
      <Modal open onClose={handleClose} title="Test">
        Content
      </Modal>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on Escape when closeOnEscape is false', () => {
    const handleClose = jest.fn();
    render(
      <Modal open onClose={handleClose} title="Test" closeOnEscape={false}>
        Content
      </Modal>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('hides the close button when showCloseButton is false', () => {
    render(
      <Modal open onClose={jest.fn()} title="Test" showCloseButton={false}>
        Content
      </Modal>,
    );
    expect(screen.queryByLabelText('Close dialog')).not.toBeInTheDocument();
  });

  it('moves focus into the dialog when opened', async () => {
    render(
      <Modal open onClose={jest.fn()} title="Test">
        <button>First focusable</button>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.getByText('First focusable')).toHaveFocus();
    });
  });

  it('locks body scroll while open', () => {
    render(
      <Modal open onClose={jest.fn()} title="Test">
        Content
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll on close', () => {
    const { rerender } = render(
      <Modal open onClose={jest.fn()} title="Test">
        Content
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('hidden');
    rerender(
      <Modal open={false} onClose={jest.fn()} title="Test">
        Content
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('');
  });

  it('has no accessibility violations', async () => {
    const { baseElement } = render(
      <Modal open onClose={jest.fn()} title="Accessible Modal" description="Description text">
        <p>Modal body content</p>
        <button>Action</button>
      </Modal>,
    );
    const results = await axe(baseElement);
    expect(results).toHaveNoViolations();
  });
});

describe('ConfirmDialog', () => {
  it('renders title, description, and both buttons', () => {
    render(
      <ConfirmDialog
        open
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        title="Delete account?"
        description="This cannot be undone."
      />,
    );
    expect(screen.getByText('Delete account?')).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button clicked', async () => {
    const handleConfirm = jest.fn();
    const user = userEvent.setup();
    render(
      <ConfirmDialog
        open
        onClose={jest.fn()}
        onConfirm={handleConfirm}
        title="T"
        description="D"
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button clicked', async () => {
    const handleClose = jest.fn();
    const user = userEvent.setup();
    render(
      <ConfirmDialog open onClose={handleClose} onConfirm={jest.fn()} title="T" description="D" />,
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('uses custom button labels', () => {
    render(
      <ConfirmDialog
        open
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        title="T"
        description="D"
        confirmLabel="Delete"
        cancelLabel="Keep"
      />,
    );
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
  });

  it('disables buttons and shows loading state', () => {
    render(
      <ConfirmDialog
        open
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        title="T"
        description="D"
        isLoading
      />,
    );
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByText('Please wait…')).toBeInTheDocument();
  });

  it('applies destructive styling when variant is destructive', () => {
    render(
      <ConfirmDialog
        open
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        title="T"
        description="D"
        variant="destructive"
      />,
    );
    expect(screen.getByRole('button', { name: 'Confirm' }).className).toContain('bg-destructive');
  });
});
