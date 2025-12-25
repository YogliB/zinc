import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/preact';
import { EditorTab } from './editor-tab';

describe('EditorTab', () => {
	it('renders tab name correctly', () => {
		const mockOnClose = vi.fn();

		render(<EditorTab name="test.txt" onClose={mockOnClose} />);

		expect(screen.getByText('test.txt')).toBeInTheDocument();
	});

	it('calls onClose when close button is clicked', () => {
		const mockOnClose = vi.fn();

		render(<EditorTab name="test.txt" onClose={mockOnClose} />);

		const closeButton = screen.getByRole('button', {
			name: /close test\.txt/i,
		});
		fireEvent.click(closeButton);

		expect(mockOnClose).toHaveBeenCalledTimes(1);
	});

	it('renders close button with correct aria-label', () => {
		const mockOnClose = vi.fn();

		render(<EditorTab name="file.js" onClose={mockOnClose} />);

		const closeButton = screen.getByRole('button', {
			name: /close file\.js/i,
		});
		expect(closeButton).toBeInTheDocument();
	});
});
