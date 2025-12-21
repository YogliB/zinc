import { render, screen, fireEvent } from '@testing-library/preact';
import { describe, it, expect, vi } from 'vitest';
import { EditorView } from './editor-view';
import { TreeNode } from '../../../lib/types';

describe('EditorView', () => {
	it('renders the resizable panels with file tree and code editor', () => {
		const mockTreeNodes: TreeNode[] = [
			{
				name: 'test-file.txt',
				type: 'file',
				path: '/test/test-file.txt',
			},
		];
		const mockOnExpand = vi.fn();
		const mockOnSelect = vi.fn();
		const mockOnEditorChange = vi.fn();

		render(
			<EditorView
				treeNodes={mockTreeNodes}
				editorValue="console.log('test');"
				onExpand={mockOnExpand}
				onSelect={mockOnSelect}
				onEditorChange={mockOnEditorChange}
			/>,
		);

		expect(screen.getByText('test-file.txt')).toBeInTheDocument();
		expect(
			screen.getByDisplayValue("console.log('test');"),
		).toBeInTheDocument();
	});

	it('calls onSelect when a file is clicked', () => {
		const mockTreeNodes: TreeNode[] = [
			{
				name: 'test-file.txt',
				type: 'file',
				path: '/test/test-file.txt',
			},
		];
		const mockOnExpand = vi.fn();
		const mockOnSelect = vi.fn();
		const mockOnEditorChange = vi.fn();

		render(
			<EditorView
				treeNodes={mockTreeNodes}
				editorValue=""
				onExpand={mockOnExpand}
				onSelect={mockOnSelect}
				onEditorChange={mockOnEditorChange}
			/>,
		);

		fireEvent.click(screen.getByText('test-file.txt'));

		expect(mockOnSelect).toHaveBeenCalledWith(mockTreeNodes[0]);
	});
});
