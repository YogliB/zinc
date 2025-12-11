import { describe, it, expect, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import { fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';

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
		const container = document.createElement('div');
		container.style.height = '400px';
		document.body.appendChild(container);
		const component = mount(FileTree, {
			target: container,
			props: { nodes: [], onSelect },
		});
		expect(
			container.querySelector('[data-testid^="file-tree-file"]'),
		).toBeNull();
		unmount(component);
		document.body.removeChild(container);
	});

	it('renders single file node', () => {
		const onSelect = vi.fn();
		const nodes: FileNode[] = [
			{ name: 'test.txt', type: 'file', path: '/test.txt' },
		];
		const container = document.createElement('div');
		container.style.height = '400px';
		document.body.appendChild(container);
		const component = mount(FileTree, {
			target: container,
			props: { nodes, onSelect },
		});
		expect(container.textContent).toContain('test.txt');
		expect(
			container.querySelector(
				'[data-testid="file-tree-file-test.txt"] [data-testid="file-tree-item-name"]',
			)?.textContent,
		).toBe('test.txt');
		unmount(component);
		document.body.removeChild(container);
	});

	it('renders single folder node', () => {
		const onSelect = vi.fn();
		const nodes: FileNode[] = [
			{ name: 'folder1', type: 'folder', path: '/folder1' },
		];
		const container = document.createElement('div');
		container.style.height = '400px';
		document.body.appendChild(container);
		const component = mount(FileTree, {
			target: container,
			props: { nodes, onSelect },
		});
		expect(container.textContent).toContain('folder1');
		// Details should be closed by default
		const details = container.querySelector(
			'[data-testid="file-tree-folder-folder1"]',
		);
		expect(details).not.toHaveAttribute('open');
		unmount(component);
		document.body.removeChild(container);
	});
	it('renders mixed files and folders', () => {
		const onSelect = vi.fn();
		const nodes: FileNode[] = [
			{ name: 'folder1', type: 'folder', path: '/folder1' },
			{ name: 'file1.txt', type: 'file', path: '/file1.txt' },
			{ name: 'folder2', type: 'folder', path: '/folder2' },
		];
		const container = document.createElement('div');
		container.style.height = '400px';
		document.body.appendChild(container);
		const component = mount(FileTree, {
			target: container,
			props: { nodes, onSelect },
		});
		expect(container.textContent).toContain('folder1');
		expect(container.textContent).toContain('folder2');
		expect(container.textContent).toContain('file1.txt');
		// Folders should appear before files due to sorting
		const texts = Array.from(
			container.querySelectorAll('[data-testid="file-tree-item-name"]'),
		).map((span) => span.textContent);
		expect(texts).toEqual(['folder1', 'folder2', 'file1.txt']);
		unmount(component);
		document.body.removeChild(container);
	});

	it('filters out .git folder', () => {
		const onSelect = vi.fn();
		const nodes: FileNode[] = [
			{ name: 'folder1', type: 'folder', path: '/folder1' },
			{ name: '.git', type: 'folder', path: '/.git' },
			{ name: 'file1.txt', type: 'file', path: '/file1.txt' },
		];
		const container = document.createElement('div');
		container.style.height = '400px';
		document.body.appendChild(container);
		const component = mount(FileTree, {
			target: container,
			props: { nodes, onSelect },
		});
		expect(
			container.querySelector('[data-testid="file-tree-folder-folder1"]'),
		).toBeTruthy();
		expect(
			container.querySelector('[data-testid="file-tree-file-file1.txt"]'),
		).toBeTruthy();
		expect(
			container.querySelector('[data-testid="file-tree-folder-.git"]'),
		).toBeNull();
		unmount(component);
		document.body.removeChild(container);
	});

	it('toggles folder open/close on click', async () => {
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
		const container = document.createElement('div');
		container.style.height = '400px';
		document.body.appendChild(container);
		const component = mount(FileTree, {
			target: container,
			props: { nodes, onSelect },
		});
		const folderDiv = container.querySelector(
			'[data-testid="file-tree-folder-folder1"]',
		) as HTMLElement;
		// Initially closed, no children div
		expect(container.querySelector('.ml-4')).toBeNull();
		folderDiv.click();
		await tick();
		// Now children div should be present
		expect(container.querySelector('.ml-4')).toBeTruthy();
		folderDiv.click();
		await tick();
		// Closed again
		expect(container.querySelector('.ml-4')).toBeNull();
		unmount(component);
		document.body.removeChild(container);
	});



	it('selects file on click', () => {
		const onSelect = vi.fn();
		const nodes: FileNode[] = [
			{ name: 'file1.txt', type: 'file', path: '/file1.txt' },
		];
		const container = document.createElement('div');
		container.style.height = '400px';
		document.body.appendChild(container);
		const component = mount(FileTree, {
			target: container,
			props: { nodes, onSelect },
		});
		const fileButton = container.querySelector(
			'[data-testid="file-tree-file-file1.txt"]',
		) as HTMLElement;
		fileButton.click();
		expect(onSelect).toHaveBeenCalledWith('/file1.txt');
		unmount(component);
		document.body.removeChild(container);
	});

	it('selects file on Enter key', () => {
		const onSelect = vi.fn();
		const nodes: FileNode[] = [
			{ name: 'file1.txt', type: 'file', path: '/file1.txt' },
		];
		const container = document.createElement('div');
		container.style.height = '400px';
		document.body.appendChild(container);
		const component = mount(FileTree, {
			target: container,
			props: { nodes, onSelect },
		});
		const fileButton = container.querySelector(
			'[data-testid="file-tree-file-file1.txt"]',
		) as HTMLElement;
		fireEvent.keyDown(fileButton, { key: 'Enter' });
		expect(onSelect).toHaveBeenCalledWith('/file1.txt');
		unmount(component);
		document.body.removeChild(container);
	});

	it('selects file on Space key', () => {
		const onSelect = vi.fn();
		const nodes: FileNode[] = [
			{ name: 'file1.txt', type: 'file', path: '/file1.txt' },
		];
		const container = document.createElement('div');
		container.style.height = '400px';
		document.body.appendChild(container);
		const component = mount(FileTree, {
			target: container,
			props: { nodes, onSelect },
		});
		const fileButton = container.querySelector(
			'[data-testid="file-tree-file-file1.txt"]',
		) as HTMLElement;
		fireEvent.keyDown(fileButton, { key: ' ' });
		expect(onSelect).toHaveBeenCalledWith('/file1.txt');
		unmount(component);
		document.body.removeChild(container);
	});

	it('renders large node list', () => {
		const onSelect = vi.fn();
		const nodes: FileNode[] = Array.from({ length: 100 }, (_, i) => ({
			name: i % 2 === 0 ? `folder${i}` : `file${i}.txt`,
			type: i % 2 === 0 ? 'folder' : 'file',
			path: `/${i % 2 === 0 ? `folder${i}` : `file${i}.txt`}`,
		}));
		const container = document.createElement('div');
		container.style.height = '400px';
		document.body.appendChild(container);
		const component = mount(FileTree, {
			target: container,
			props: { nodes, onSelect },
		});
		// Check that some items are rendered (virtual list handles large lists)
		expect(
			container.querySelectorAll('[data-testid="file-tree-item-name"]')
				.length,
		).toBeGreaterThan(0);
		// Folders first due to sorting
		const firstSpan = container.querySelector(
			'[data-testid="file-tree-item-name"]',
		);
		expect(firstSpan?.textContent).toMatch(/^folder/);
		unmount(component);
		document.body.removeChild(container);
	});
});
