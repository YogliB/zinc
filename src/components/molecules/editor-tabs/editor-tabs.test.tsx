import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/preact';
import { EditorTabs } from './editor-tabs';
import { OpenFile } from '@/lib/types';

describe('EditorTabs', () => {
	const mockOpenFiles: OpenFile[] = [
		{ path: '/path/to/file1.txt', name: 'file1.txt', content: 'content1' },
		{ path: '/path/to/file2.js', name: 'file2.js', content: 'content2' },
		{ path: '/path/to/file3.tsx', name: 'file3.tsx', content: 'content3' },
	];

	it('renders correct number of tabs from openFiles', () => {
		const mockOnTabSelect = vi.fn();
		const mockOnTabClose = vi.fn();

		render(
			<EditorTabs
				openFiles={mockOpenFiles}
				activeFilePath="/path/to/file1.txt"
				onTabSelect={mockOnTabSelect}
				onTabClose={mockOnTabClose}
			/>,
		);

		expect(screen.getByText('file1.txt')).toBeInTheDocument();
		expect(screen.getByText('file2.js')).toBeInTheDocument();
		expect(screen.getByText('file3.tsx')).toBeInTheDocument();
	});

	it('highlights active tab correctly', () => {
		const mockOnTabSelect = vi.fn();
		const mockOnTabClose = vi.fn();

		render(
			<EditorTabs
				openFiles={mockOpenFiles}
				activeFilePath="/path/to/file2.js"
				onTabSelect={mockOnTabSelect}
				onTabClose={mockOnTabClose}
			/>,
		);

		const activeButton = screen
			.getAllByRole('button')
			.find(
				(button) =>
					button.getAttribute('value') === '/path/to/file2.js',
			);
		expect(activeButton).toBeInTheDocument();
	});

	it('calls onTabSelect with correct path when tab is clicked', () => {
		const mockOnTabSelect = vi.fn();
		const mockOnTabClose = vi.fn();

		render(
			<EditorTabs
				openFiles={mockOpenFiles}
				activeFilePath="/path/to/file1.txt"
				onTabSelect={mockOnTabSelect}
				onTabClose={mockOnTabClose}
			/>,
		);

		fireEvent.click(screen.getByText('file2.js'));

		expect(mockOnTabSelect).toHaveBeenCalledWith('/path/to/file2.js');
	});

	it('calls onTabClose with correct path when close button is clicked', () => {
		const mockOnTabSelect = vi.fn();
		const mockOnTabClose = vi.fn();

		render(
			<EditorTabs
				openFiles={mockOpenFiles}
				activeFilePath="/path/to/file1.txt"
				onTabSelect={mockOnTabSelect}
				onTabClose={mockOnTabClose}
			/>,
		);

		const closeButton = screen.getByRole('button', {
			name: /close file2\.js/i,
		});
		fireEvent.click(closeButton);

		expect(mockOnTabClose).toHaveBeenCalledWith('/path/to/file2.js');
		expect(mockOnTabSelect).not.toHaveBeenCalled();
	});

	it('handles empty openFiles array gracefully', () => {
		const mockOnTabSelect = vi.fn();
		const mockOnTabClose = vi.fn();

		const { container } = render(
			<EditorTabs
				openFiles={[]}
				activeFilePath={undefined}
				onTabSelect={mockOnTabSelect}
				onTabClose={mockOnTabClose}
			/>,
		);

		expect(container.firstChild).toBeNull();
	});

	it('does not call onTabSelect when close button is clicked', () => {
		const mockOnTabSelect = vi.fn();
		const mockOnTabClose = vi.fn();

		render(
			<EditorTabs
				openFiles={mockOpenFiles}
				activeFilePath="/path/to/file1.txt"
				onTabSelect={mockOnTabSelect}
				onTabClose={mockOnTabClose}
			/>,
		);

		const closeButton = screen.getByRole('button', {
			name: /close file1\.txt/i,
		});
		fireEvent.click(closeButton);

		expect(mockOnTabClose).toHaveBeenCalledWith('/path/to/file1.txt');
		expect(mockOnTabSelect).not.toHaveBeenCalled();
	});

	it('applies fixed width to tabs', () => {
		const mockOnTabSelect = vi.fn();
		const mockOnTabClose = vi.fn();

		render(
			<EditorTabs
				openFiles={mockOpenFiles}
				activeFilePath="/path/to/file1.txt"
				onTabSelect={mockOnTabSelect}
				onTabClose={mockOnTabClose}
			/>,
		);

		const tabs = screen
			.getAllByRole('button')
			.filter((tab) => tab.hasAttribute('value'));
		for (const tab of tabs) {
			expect(tab).toHaveClass('w-40');
		}
	});

	it('truncates long filenames', () => {
		const longName = 'very-long-filename-that-should-be-truncated.tsx';
		const mockFiles: OpenFile[] = [
			{
				path: `/path/to/${longName}`,
				name: longName,
				content: 'content',
			},
		];
		const mockOnTabSelect = vi.fn();
		const mockOnTabClose = vi.fn();

		render(
			<EditorTabs
				openFiles={mockFiles}
				activeFilePath={`/path/to/${longName}`}
				onTabSelect={mockOnTabSelect}
				onTabClose={mockOnTabClose}
			/>,
		);

		const span = screen.getByText(longName);
		expect(span).toHaveClass('truncate');
		expect(span).toHaveClass('max-w-32');
	});

	it('shows tooltip with full path on hover', async () => {
		const mockOnTabSelect = vi.fn();
		const mockOnTabClose = vi.fn();

		render(
			<EditorTabs
				openFiles={mockOpenFiles}
				activeFilePath="/path/to/file1.txt"
				onTabSelect={mockOnTabSelect}
				onTabClose={mockOnTabClose}
			/>,
		);

		const tab = screen.getByText('file1.txt');
		fireEvent.mouseEnter(tab);

		await waitFor(() => {
			expect(screen.getByText('/path/to/file1.txt')).toBeInTheDocument();
		});
	});
});
