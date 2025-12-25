import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/preact';
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

		const activeTab = screen
			.getByText('file2.js')
			.closest('[data-state="active"]');
		expect(activeTab).toBeInTheDocument();
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
});
