import { render, screen, fireEvent } from '@testing-library/preact';
import { describe, it, expect, vi } from 'vitest';
import { EditorView } from './editor-view';
import { TreeNode, OpenFile } from '../../../lib/types';

describe('EditorView', () => {
	it('renders the resizable panels with file tree and tabbed editor', () => {
		const mockTreeNodes: TreeNode[] = [
			{
				name: 'test-file.txt',
				type: 'file',
				path: '/test/test-file.txt',
			},
		];
		const mockOpenFiles: OpenFile[] = [
			{
				path: '/test/test-file.txt',
				name: 'test-file.txt',
				content: "console.log('test');",
			},
		];
		const mockOnExpand = vi.fn();
		const mockOnSelect = vi.fn();
		const mockOnTabSelect = vi.fn();
		const mockOnTabClose = vi.fn();
		const mockOnEditorChange = vi.fn();

		render(
			<EditorView
				treeNodes={mockTreeNodes}
				openFiles={mockOpenFiles}
				activeFilePath="/test/test-file.txt"
				onExpand={mockOnExpand}
				onSelect={mockOnSelect}
				onTabSelect={mockOnTabSelect}
				onTabClose={mockOnTabClose}
				onEditorChange={mockOnEditorChange}
			/>,
		);

		expect(screen.getByText('test-file.txt')).toBeInTheDocument();
		expect(screen.getByText('test-file.txt')).toBeInTheDocument(); // Tab name
	});

	it('calls onSelect when a file is clicked', () => {
		const mockTreeNodes: TreeNode[] = [
			{
				name: 'test-file.txt',
				type: 'file',
				path: '/test/test-file.txt',
			},
		];
		const mockOpenFiles: OpenFile[] = [];
		const mockOnExpand = vi.fn();
		const mockOnSelect = vi.fn();
		const mockOnTabSelect = vi.fn();
		const mockOnTabClose = vi.fn();
		const mockOnEditorChange = vi.fn();

		render(
			<EditorView
				treeNodes={mockTreeNodes}
				openFiles={mockOpenFiles}
				activeFilePath={undefined}
				onExpand={mockOnExpand}
				onSelect={mockOnSelect}
				onTabSelect={mockOnTabSelect}
				onTabClose={mockOnTabClose}
				onEditorChange={mockOnEditorChange}
			/>,
		);

		fireEvent.click(screen.getByText('test-file.txt'));

		expect(mockOnSelect).toHaveBeenCalledWith(mockTreeNodes[0]);
	});
});
