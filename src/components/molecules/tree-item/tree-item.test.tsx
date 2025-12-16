import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/preact';
import { TreeItem } from './tree-item';
import { TreeNode } from '@/lib/types';

const sampleFile: TreeNode = {
	name: 'example.txt',
	type: 'file',
};

const sampleFolder: TreeNode = {
	name: 'src',
	type: 'folder',
	children: [{ name: 'main.ts', type: 'file' }],
};

describe('TreeItem', () => {
	it('renders file item', () => {
		render(<TreeItem node={sampleFile} />);
		expect(screen.getByText('example.txt')).toBeInTheDocument();
	});

	it('renders folder item', () => {
		render(<TreeItem node={sampleFolder} />);
		expect(screen.getByText('src')).toBeInTheDocument();
	});

	it('expands folder on click', async () => {
		render(<TreeItem node={sampleFolder} />);
		const trigger = screen.getByText('src');
		fireEvent.click(trigger);
		expect(screen.getByText('main.ts')).toBeInTheDocument();
	});
});
