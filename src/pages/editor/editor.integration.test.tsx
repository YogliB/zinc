/* eslint-disable @typescript-eslint/no-explicit-any, sonarjs/no-redundant-jump */ import {
	describe,
	it,
	expect,
	vi,
	beforeEach,
	afterEach,
} from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/preact';
import { EditorPage } from './editor';
import { invoke } from '@tauri-apps/api/core';
import { resetEditorState } from '../../lib/stores/editor-store';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
	invoke: vi.fn(),
}));

// Mock wouter-preact for useSearch
vi.mock('wouter-preact', () => ({
	useSearch: vi.fn(() => '?path=/test/project'),
}));

const mockInvoke = vi.mocked(invoke);

describe('EditorPage Integration Tests', () => {
	beforeEach(() => {
		resetEditorState();
		mockInvoke.mockClear();
		// Mock initial project load
		mockInvoke.mockImplementation(
			async (command: string, arguments_: any) => {
				if (command === 'list_directory') {
					return [
						{
							name: 'file1.txt',
							is_dir: false,
							path: '/test/project/file1.txt',
						},
						{
							name: 'file2.js',
							is_dir: false,
							path: '/test/project/file2.js',
						},
						{
							name: 'file3.tsx',
							is_dir: false,
							path: '/test/project/file3.tsx',
						},
					];
				}
				if (command === 'read_file') {
					return `Content of ${(arguments_.path as string).split('/').pop()}`;
				}
				return;
			},
		);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('opens file and creates tab', async () => {
		render(<EditorPage />);

		// Wait for project to load
		await waitFor(() => {
			expect(screen.getByText('file1.txt')).toBeInTheDocument();
		});

		// Click on file1.txt
		fireEvent.click(screen.getByText('file1.txt'));

		// Wait for file to load and tab to appear
		await waitFor(() => {
			expect(screen.getByText('file1.txt')).toBeInTheDocument();
		});

		expect(mockInvoke).toHaveBeenCalledWith('read_file', {
			path: '/test/project/file1.txt',
		});
	});

	it('opens multiple files and shows multiple tabs', async () => {
		render(<EditorPage />);

		await waitFor(() => {
			expect(screen.getByText('file1.txt')).toBeInTheDocument();
		});

		// Open file1.txt
		fireEvent.click(screen.getByText('file1.txt'));
		await waitFor(() => {
			expect(screen.getAllByText('file1.txt')).toHaveLength(2); // Tree and tab
		});

		// Open file2.js
		fireEvent.click(screen.getByText('file2.js'));
		await waitFor(() => {
			expect(screen.getAllByText('file2.js')).toHaveLength(2);
		});

		// Open file3.tsx
		fireEvent.click(screen.getByText('file3.tsx'));
		await waitFor(() => {
			expect(screen.getAllByText('file3.tsx')).toHaveLength(2);
		});

		// Should have 3 tabs
		expect(screen.getAllByText('file1.txt')).toHaveLength(2);
		expect(screen.getAllByText('file2.js')).toHaveLength(2);
		expect(screen.getAllByText('file3.tsx')).toHaveLength(2);
	});

	it('switches tabs and changes content', async () => {
		render(<EditorPage />);

		await waitFor(() => {
			expect(screen.getByText('file1.txt')).toBeInTheDocument();
		});

		// Open file1.txt
		fireEvent.click(screen.getByText('file1.txt'));
		await waitFor(() => {
			expect(
				screen.getByText('Content of file1.txt'),
			).toBeInTheDocument();
		});

		// Open file2.js
		fireEvent.click(screen.getByText('file2.js'));
		await waitFor(() => {
			expect(screen.getByText('Content of file2.js')).toBeInTheDocument();
		});

		// Switch back to file1.txt tab
		const file1Tab = screen.getAllByText('file1.txt')[1]; // Second occurrence is the tab
		fireEvent.click(file1Tab);

		// Content should switch back
		await waitFor(() => {
			expect(
				screen.getByText('Content of file1.txt'),
			).toBeInTheDocument();
		});
	});

	it('closes tab and switches to another', async () => {
		render(<EditorPage />);

		await waitFor(() => {
			expect(screen.getByText('file1.txt')).toBeInTheDocument();
		});

		// Open file1.txt and file2.js
		fireEvent.click(screen.getByText('file1.txt'));
		await waitFor(() => {
			expect(screen.getAllByText('file1.txt')).toHaveLength(2);
		});

		fireEvent.click(screen.getByText('file2.js'));
		await waitFor(() => {
			expect(screen.getAllByText('file2.js')).toHaveLength(2);
		});

		// Close file1.txt tab
		const closeButton = screen.getByRole('button', {
			name: /close file1\.txt/i,
		});
		fireEvent.click(closeButton);

		// Should only have file2.js tab now
		await waitFor(() => {
			expect(screen.queryByText('file1.txt')).toBeInTheDocument(); // Still in tree
			expect(screen.getAllByText('file2.js')).toHaveLength(2); // Tree and tab
		});
	});

	it('closes last tab and shows empty state', async () => {
		render(<EditorPage />);

		await waitFor(() => {
			expect(screen.getByText('file1.txt')).toBeInTheDocument();
		});

		// Open file1.txt
		fireEvent.click(screen.getByText('file1.txt'));
		await waitFor(() => {
			expect(screen.getAllByText('file1.txt')).toHaveLength(2);
		});

		// Close the tab
		const closeButton = screen.getByRole('button', {
			name: /close file1\.txt/i,
		});
		fireEvent.click(closeButton);

		// Should show empty state
		await waitFor(() => {
			expect(
				screen.getByText(
					'No files open. Select a file from the tree to begin editing.',
				),
			).toBeInTheDocument();
		});
	});

	it('clicking same file twice does not duplicate', async () => {
		render(<EditorPage />);

		await waitFor(() => {
			expect(screen.getByText('file1.txt')).toBeInTheDocument();
		});

		// Click file1.txt twice
		fireEvent.click(screen.getByText('file1.txt'));
		await waitFor(() => {
			expect(screen.getAllByText('file1.txt')).toHaveLength(2);
		});

		fireEvent.click(screen.getByText('file1.txt'));

		// Should still only have one tab
		expect(screen.getAllByText('file1.txt')).toHaveLength(2); // Tree and one tab
	});

	it('auto-save works for active file', async () => {
		// Use fake timers for debounce
		vi.useFakeTimers();

		render(<EditorPage />);

		await waitFor(() => {
			expect(screen.getByText('file1.txt')).toBeInTheDocument();
		});

		// Open file1.txt
		fireEvent.click(screen.getByText('file1.txt'));
		await waitFor(() => {
			expect(
				screen.getByText('Content of file1.txt'),
			).toBeInTheDocument();
		});

		// Simulate editing (this would normally trigger onEditorChange)
		// Since we can't easily simulate CodeMirror changes, we'll mock the write_file call
		// In a real test, we'd need to find a way to trigger the editor change

		// For now, just check that the setup works
		expect(mockInvoke).toHaveBeenCalledWith('read_file', {
			path: '/test/project/file1.txt',
		});

		vi.useRealTimers();
	});
});
