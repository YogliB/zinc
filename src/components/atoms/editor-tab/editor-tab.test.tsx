import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/preact';
import { EditorTab } from './editor-tab';

describe('EditorTab', () => {
	it('renders tab name correctly', () => {
		const mockOnSelect = vi.fn();
		const mockOnClose = vi.fn();

		render(
			<EditorTab
				name="test.txt"
				isActive={false}
				onSelect={mockOnSelect}
				onClose={mockOnClose}
			/>,
		);

		expect(screen.getByText('test.txt')).toBeInTheDocument();
	});

	it('calls onSelect when tab is clicked', () => {
		const mockOnSelect = vi.fn();
		const mockOnClose = vi.fn();

		render(
			<EditorTab
				name="test.txt"
				isActive={false}
				onSelect={mockOnSelect}
				onClose={mockOnClose}
			/>,
		);

		fireEvent.click(screen.getByText('test.txt'));

		expect(mockOnSelect).toHaveBeenCalledTimes(1);
		expect(mockOnClose).not.toHaveBeenCalled();
	});

	it('calls onClose when close button is clicked', () => {
		const mockOnSelect = vi.fn();
		const mockOnClose = vi.fn();

		render(
			<EditorTab
				name="test.txt"
				isActive={false}
				onSelect={mockOnSelect}
				onClose={mockOnClose}
			/>,
		);

		const closeButton = screen.getByRole('button', {
			name: /close test\.txt/i,
		});
		fireEvent.click(closeButton);

		expect(mockOnClose).toHaveBeenCalledTimes(1);
		expect(mockOnSelect).not.toHaveBeenCalled();
	});

	it('shows active styling when isActive is true', () => {
		const mockOnSelect = vi.fn();
		const mockOnClose = vi.fn();

		render(
			<EditorTab
				name="test.txt"
				isActive={true}
				onSelect={mockOnSelect}
				onClose={mockOnClose}
			/>,
		);

		const tab = screen.getByText('test.txt').parentElement;
		expect(tab).toHaveClass('border-blue-500');
		expect(tab).toHaveClass('bg-blue-50');
	});

	it('does not show active styling when isActive is false', () => {
		const mockOnSelect = vi.fn();
		const mockOnClose = vi.fn();

		render(
			<EditorTab
				name="test.txt"
				isActive={false}
				onSelect={mockOnSelect}
				onClose={mockOnClose}
			/>,
		);

		const tab = screen.getByText('test.txt').parentElement;
		expect(tab).toHaveClass('border-transparent');
		expect(tab).not.toHaveClass('bg-blue-50');
	});
});
