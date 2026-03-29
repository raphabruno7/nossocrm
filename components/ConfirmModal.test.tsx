import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import ConfirmModal from './ConfirmModal';
import { axe } from '@/lib/a11y/test/a11y-utils';
import ptMessages from '@/messages/pt.json';

// Mock focus-trap-react
vi.mock('focus-trap-react', () => ({
  default: ({ children, active }: { children: React.ReactNode; active: boolean }) => (
    <div data-testid="focus-trap" data-active={active}>
      {children}
    </div>
  ),
}));

function renderWithIntl(ui: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale="pt" messages={ptMessages}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe('ConfirmModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Accessibility', () => {
    it('should have role="alertdialog"', () => {
      renderWithIntl(<ConfirmModal {...defaultProps} />);
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('should have aria-modal="true"', () => {
      renderWithIntl(<ConfirmModal {...defaultProps} />);
      expect(screen.getByRole('alertdialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-labelledby pointing to title', () => {
      renderWithIntl(<ConfirmModal {...defaultProps} />);
      const dialog = screen.getByRole('alertdialog');
      const labelledBy = dialog.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();
      
      const title = document.getElementById(labelledBy!);
      expect(title).toHaveTextContent('Confirm Action');
    });

    it('should have aria-describedby pointing to message', () => {
      renderWithIntl(<ConfirmModal {...defaultProps} />);
      const dialog = screen.getByRole('alertdialog');
      const describedBy = dialog.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      
      const message = document.getElementById(describedBy!);
      expect(message).toHaveTextContent('Are you sure you want to proceed?');
    });

    it('should have accessible buttons', () => {
      renderWithIntl(<ConfirmModal {...defaultProps} />);
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /confirmar/i })).toBeInTheDocument();
    });

    it('should position cancel button as the safest default option', () => {
      renderWithIntl(<ConfirmModal {...defaultProps} />);
      // Cancel button should exist and be accessible
      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      expect(cancelButton).toBeInTheDocument();
      // In destructive dialogs, cancel should be the first button in DOM order
      const allButtons = screen.getAllByRole('button');
      expect(allButtons[0]).toHaveTextContent(/cancelar/i);
    });

    it('should pass axe accessibility tests', async () => {
      const { container } = renderWithIntl(<ConfirmModal {...defaultProps} />);
      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
    });
  });

  describe('Focus Management', () => {
    it('should render FocusTrap when open', () => {
      renderWithIntl(<ConfirmModal {...defaultProps} />);
      expect(screen.getByTestId('focus-trap')).toHaveAttribute('data-active', 'true');
    });

    it('should not render when closed', () => {
      renderWithIntl(<ConfirmModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId('focus-trap')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when cancel is clicked', async () => {
      const onClose = vi.fn();
      renderWithIntl(<ConfirmModal {...defaultProps} onClose={onClose} />);
      
      await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onConfirm and onClose when confirm is clicked', async () => {
      const onClose = vi.fn();
      const onConfirm = vi.fn();
      renderWithIntl(<ConfirmModal {...defaultProps} onClose={onClose} onConfirm={onConfirm} />);
      
      await userEvent.click(screen.getByRole('button', { name: /confirmar/i }));
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', async () => {
      const onClose = vi.fn();
      const { container } = renderWithIntl(<ConfirmModal {...defaultProps} onClose={onClose} />);
      
      const backdrop = container.querySelector('.fixed.inset-0');
      if (backdrop) {
        await userEvent.click(backdrop);
        expect(onClose).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('Custom Text', () => {
    it('should render custom confirm text', () => {
      renderWithIntl(<ConfirmModal {...defaultProps} confirmText="Delete" />);
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('should render custom cancel text', () => {
      renderWithIntl(<ConfirmModal {...defaultProps} cancelText="Go Back" />);
      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should apply danger variant styles', () => {
      renderWithIntl(<ConfirmModal {...defaultProps} variant="danger" />);
      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      expect(confirmButton).toHaveClass('bg-red-600');
    });

    it('should apply primary variant styles', () => {
      renderWithIntl(<ConfirmModal {...defaultProps} variant="primary" />);
      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      expect(confirmButton).toHaveClass('bg-primary-600');
    });
  });
});
