import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/preact';
import { FileTree } from './file-tree';
import { TreeNode } from '../../lib/types';

const sampleNodes: TreeNode[] = [
	{ name: 'file1.txt', type: 'file' },
	{
		name: 'folder1',
		type: 'folder',
		children: [{ name: 'file2.txt', type: 'file' }],
	},
];

describe('FileTree', () => {
	it('renders all nodes', () => {
		render(<FileTree nodes={sampleNodes} />);
		expect(screen.getByText('file1.txt')).toBeInTheDocument();
		expect(screen.getByText('folder1')).toBeInTheDocument();
	});

	it('renders empty tree', () => {
		render(<FileTree nodes={[]} />);
		expect(screen.queryByText(/./)).toBeNull();
	});
});
