import { describe, it, expect, vi } from 'vitest';
import { mount, unmount } from 'svelte';
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
		const component = mount(FileTree, {
			target: document.body,
			props: { nodes: [], onSelect },
		});
		expect(document.querySelector('button')).toBeNull();
		unmount(component);
	});

	it('renders single file node', () => {
		const onSelect = vi.fn();
		const nodes: FileNode[] = [
			{ name: 'test.txt', type: 'file', path: '/test.txt' },
		];
		const component = mount(FileTree, {
			target: document.body,
			props: { nodes, onSelect },
		});
		expect(document.body.textContent).toContain('test.txt');
		expect(document.querySelector('button')?.textContent).toBe('test.txt');
		unmount(component);
	});

	it('renders single folder node', () => {
		const onSelect = vi.fn();
		const nodes: FileNode[] = [
			{ name: 'folder1', type: 'folder', path: '/folder1' },
		];
		const component = mount(FileTree, {
			target: document.body,
			props: { nodes, onSelect },
		});
		expect(document.body.textContent).toContain('folder1');
		// Details should be closed by default
		const details = document.querySelector('details');
		expect(details).not.toHaveAttribute('open');
		unmount(component);
	});
	it('renders mixed files and folders', () => {
		const onSelect = vi.fn();
		const nodes: FileNode[] = [
			{ name: 'folder1', type: 'folder', path: '/folder1' },
			{ name: 'file1.txt', type: 'file', path: '/file1.txt' },
			{ name: 'folder2', type: 'folder', path: '/folder2' },
		];
		const component = mount(FileTree, {
			target: document.body,
			props: { nodes, onSelect },
		});
		expect(document.body.textContent).toContain('folder1');
		expect(document.body.textContent).toContain('folder2');
		expect(document.body.textContent).toContain('file1.txt');
		// Folders should appear before files due to sorting
		const container = document.querySelector('div[style*="height: 100%"]');
		const texts = Array.from(container!.querySelectorAll('span')).map(
			(span) => span.textContent,
		);
		expect(texts).toEqual(['folder1', 'folder2', 'file1.txt']);
		unmount(component);
	});

	it('filters out .git folder', () => {
		const onSelect = vi.fn();
		const nodes: FileNode[] = [
			{ name: 'folder1', type: 'folder', path: '/folder1' },
			{ name: '.git', type: 'folder', path: '/.git' },
			{ name: 'file1.txt', type: 'file', path: '/file1.txt' },
		];
		const component = mount(FileTree, {
			target: document.body,
			props: { nodes, onSelect },
		});
		expect(document.body.textContent).toContain('folder1');
		expect(document.body.textContent).toContain('file1.txt');
		expect(document.body.textContent).not.toContain('.git');
		unmount(component);
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
		const component = mount(FileTree, {
			target: document.body,
			props: { nodes, onSelect },
		});
		const summary = document.querySelector('summary') as HTMLElement;
		const details = summary.closest('details') as HTMLDetailsElement;
		expect(details.open).toBe(false);
		summary.click();
		expect(details.open).toBe(true);
		summary.click();
		expect(details.open).toBe(false);
		unmount(component);
	});

	it('selects file on click', () => {
		const onSelect = vi.fn();
		const nodes: FileNode[] = [
			{ name: 'file1.txt', type: 'file', path: '/file1.txt' },
		];
		const component = mount(FileTree, {
			target: document.body,
			props: { nodes, onSelect },
		});
		const fileButton = document.querySelector(
			'button',
		) as HTMLButtonElement;
		fileButton.click();
		expect(onSelect).toHaveBeenCalledWith('/file1.txt');
		unmount(component);
	});

	it('selects file on Enter key', () => {
		const onSelect = vi.fn();
		const nodes: FileNode[] = [
			{ name: 'file1.txt', type: 'file', path: '/file1.txt' },
		];
		const component = mount(FileTree, {
			target: document.body,
			props: { nodes, onSelect },
		});
		const fileButton = document.querySelector(
			'button',
		) as HTMLButtonElement;
		fileButton.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Enter' }),
		);
		expect(onSelect).toHaveBeenCalledWith('/file1.txt');
		unmount(component);
	});

	it('selects file on Space key', () => {
		const onSelect = vi.fn();
		const nodes: FileNode[] = [
			{ name: 'file1.txt', type: 'file', path: '/file1.txt' },
		];
		const component = mount(FileTree, {
			target: document.body,
			props: { nodes, onSelect },
		});
		const fileButton = document.querySelector(
			'button',
		) as HTMLButtonElement;
		fileButton.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
		expect(onSelect).toHaveBeenCalledWith('/file1.txt');
		unmount(component);
	});

	it('renders large node list', () => {
		const onSelect = vi.fn();
		const nodes: FileNode[] = Array.from({ length: 100 }, (_, i) => ({
			name: i % 2 === 0 ? `folder${i}` : `file${i}.txt`,
			type: i % 2 === 0 ? 'folder' : 'file',
			path: `/${i % 2 === 0 ? `folder${i}` : `file${i}.txt`}`,
		}));
		const component = mount(FileTree, {
			target: document.body,
			props: { nodes, onSelect },
		});
		// Check that some items are rendered (virtual list handles large lists)
		expect(document.querySelectorAll('span').length).toBeGreaterThan(0);
		// Folders first due to sorting
		const firstSpan = document.querySelector('span');
		expect(firstSpan?.textContent).toMatch(/^folder/);
		unmount(component);
	});
});
