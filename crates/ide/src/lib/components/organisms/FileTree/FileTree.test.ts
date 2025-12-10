import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import FileTree from './FileTree.svelte';

interface FileNode {
	name: string;
	type: 'file' | 'folder';
	children?: FileNode[];
	path: string;
}

describe('FileTree', () => {
	it('renders empty nodes', () => {
		const onSelect = vi.fn();
		render(FileTree, { props: { nodes: [], onSelect } });
		expect(screen.queryByRole('button')).toBeNull();
	});

	it('renders single file node', () => {
		const onSelect = vi.fn();
		const nodes: FileNode[] = [
			{ name: 'test.txt', type: 'file', path: '/test.txt' },
		];
		render(FileTree, { props: { nodes, onSelect } });
		expect(screen.getByText('test.txt')).toBeInTheDocument();
		expect(screen.getByRole('button')).toHaveTextContent('test.txt');
	});

	it('renders single folder node', () => {
		const onSelect = vi.fn();
		const nodes: FileNode[] = [
			{ name: 'folder1', type: 'folder', path: '/folder1' },
		];
		render(FileTree, { props: { nodes, onSelect } });
		expect(screen.getByText('folder1')).toBeInTheDocument();
		// Details should be closed by default
		const details = document.querySelector('details');
		expect(details).not.toHaveAttribute('open');
	});
	it('renders mixed files and folders', () => {
		const onSelect = vi.fn();
		const nodes: FileNode[] = [
			{ name: 'folder1', type: 'folder', path: '/folder1' },
			{ name: 'file1.txt', type: 'file', path: '/file1.txt' },
			{ name: 'folder2', type: 'folder', path: '/folder2' },
		];
		render(FileTree, { props: { nodes, onSelect } });
		expect(screen.getByText('folder1')).toBeInTheDocument();
		expect(screen.getByText('folder2')).toBeInTheDocument();
		expect(screen.getByText('file1.txt')).toBeInTheDocument();
		// Folders should appear before files due to sorting
		const container = document.querySelector('div[style*="height: 100%"]');
		const texts = Array.from(container!.querySelectorAll('span')).map(
			(span) => span.textContent,
		);
		expect(texts).toEqual(['folder1', 'folder2', 'file1.txt']);
	});

	it('filters out .git folder', () => {
		const onSelect = vi.fn();
		const nodes: FileNode[] = [
			{ name: 'folder1', type: 'folder', path: '/folder1' },
			{ name: '.git', type: 'folder', path: '/.git' },
			{ name: 'file1.txt', type: 'file', path: '/file1.txt' },
		];
		render(FileTree, { props: { nodes, onSelect } });
		expect(screen.getByText('folder1')).toBeInTheDocument();
		expect(screen.getByText('file1.txt')).toBeInTheDocument();
		expect(screen.queryByText('.git')).not.toBeInTheDocument();
	});

	it('toggles folder open/close on summary click', () => {
		const onSelect = vi.fn();
		const nodes: FileNode[] = [
			{
				name: 'folder1',
				type: 'folder',
				path: '/folder1',
				children: [
					{
						name: 'file1.txt',
						type: 'file',
						path: '/folder1/file1.txt',
					},
				],
			},
		];
		render(FileTree, { props: { nodes, onSelect } });
		const summary = screen.getByText('folder1');
		const details = summary.closest('details') as HTMLDetailsElement;
		expect(details.open).toBe(false);
		fireEvent.click(summary);
		expect(details.open).toBe(true);
		fireEvent.click(summary);
		expect(details.open).toBe(false);
	});

	it('selects file on click', () => {
		const onSelect = vi.fn();
		const nodes: FileNode[] = [
			{ name: 'file1.txt', type: 'file', path: '/file1.txt' },
		];
		render(FileTree, { props: { nodes, onSelect } });
		const fileButton = screen.getByRole('button');
		fireEvent.click(fileButton);
		expect(onSelect).toHaveBeenCalledWith('/file1.txt');
	});

	it('selects file on Enter key', () => {
		const onSelect = vi.fn();
		const nodes: FileNode[] = [
			{ name: 'file1.txt', type: 'file', path: '/file1.txt' },
		];
		render(FileTree, { props: { nodes, onSelect } });
		const fileButton = screen.getByRole('button');
		fireEvent.keyDown(fileButton, { key: 'Enter' });
		expect(onSelect).toHaveBeenCalledWith('/file1.txt');
	});

	it('selects file on Space key', () => {
		const onSelect = vi.fn();
		const nodes: FileNode[] = [
			{ name: 'file1.txt', type: 'file', path: '/file1.txt' },
		];
		render(FileTree, { props: { nodes, onSelect } });
		const fileButton = screen.getByRole('button');
		fireEvent.keyDown(fileButton, { key: ' ' });
		expect(onSelect).toHaveBeenCalledWith('/file1.txt');
	});

	it('renders large node list', () => {
		const onSelect = vi.fn();
		const nodes: FileNode[] = Array.from({ length: 100 }, (_, i) => ({
			name: i % 2 === 0 ? `folder${i}` : `file${i}.txt`,
			type: i % 2 === 0 ? 'folder' : 'file',
			path: `/${i % 2 === 0 ? `folder${i}` : `file${i}.txt`}`,
		}));
		render(FileTree, { props: { nodes, onSelect } });
		// Check that some items are rendered (virtual list handles large lists)
		expect(document.querySelectorAll('span').length).toBeGreaterThan(0);
		// Folders first due to sorting
		const firstSpan = document.querySelector('span');
		expect(firstSpan?.textContent).toMatch(/^folder/);
	});
});
