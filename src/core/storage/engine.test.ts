import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { StorageEngine } from './engine';
import { PathValidationError, FileNotFoundError } from './errors';

const testDir = join(
	process.cwd(),
	'.test-storage',
	`engine-${process.pid}-${Date.now()}`,
);

describe('StorageEngine', () => {
	let engine: StorageEngine;

	beforeEach(async () => {
		await mkdir(testDir, { recursive: true });
		engine = new StorageEngine({ rootPath: testDir });
	});

	afterEach(async () => {
		await rm(testDir, { recursive: true, force: true });
	});

	describe('validatePath', () => {
		it('should reject path traversal attempts', () => {
			expect(() => engine['validatePath']('../etc/passwd')).toThrow(
				PathValidationError,
			);
		});

		it('should reject absolute paths', () => {
			expect(() => engine['validatePath']('/etc/passwd')).toThrow(
				PathValidationError,
			);
		});

		it('should reject empty paths', () => {
			expect(() => engine['validatePath']('')).toThrow(
				PathValidationError,
			);
		});

		it('should accept valid relative paths', () => {
			expect(() => engine['validatePath']('file.txt')).not.toThrow();
			expect(() => engine['validatePath']('dir/file.txt')).not.toThrow();
			expect(() =>
				engine['validatePath']('dir/subdir/file.txt'),
			).not.toThrow();
		});
	});

	describe('writeFile', () => {
		it('should write a file successfully', async () => {
			const content = 'Hello, World!';
			await engine.writeFile('test.txt', content);

			const written = await engine.readFile('test.txt');
			expect(written).toBe(content);
		});

		it('should create parent directories recursively', async () => {
			const content = 'Nested content';
			await engine.writeFile('a/b/c/test.txt', content);

			const written = await engine.readFile('a/b/c/test.txt');
			expect(written).toBe(content);
		});

		it('should overwrite existing files', async () => {
			const content1 = 'First content';
			const content2 = 'Second content';

			await engine.writeFile('test.txt', content1);
			await engine.writeFile('test.txt', content2);

			const written = await engine.readFile('test.txt');
			expect(written).toBe(content2);
		});

		it('should reject path traversal attempts', async () => {
			await expect(
				engine.writeFile('../etc/passwd', 'malicious'),
			).rejects.toThrow(PathValidationError);
		});

		it('should handle nested writes correctly', async () => {
			const content = 'nested content';
			await engine.writeFile('a/b/c/nested.txt', content);

			const read = await engine.readFile('a/b/c/nested.txt');
			expect(read).toBe(content);
		});
	});

	describe('readFile', () => {
		it('should read an existing file', async () => {
			const content = 'Test content';
			await engine.writeFile('test.txt', content);

			const read = await engine.readFile('test.txt');
			expect(read).toBe(content);
		});

		it('should throw FileNotFoundError for missing files', async () => {
			await expect(engine.readFile('nonexistent.txt')).rejects.toThrow(
				FileNotFoundError,
			);
		});

		it('should reject path traversal attempts', async () => {
			await expect(engine.readFile('../etc/passwd')).rejects.toThrow(
				PathValidationError,
			);
		});

		it('should handle UTF-8 content correctly', async () => {
			const content = '你好世界 🌍 مرحبا بالعالم';
			await engine.writeFile('unicode.txt', content);

			const read = await engine.readFile('unicode.txt');
			expect(read).toBe(content);
		});
	});

	describe('exists', () => {
		it('should return true for existing files', async () => {
			await engine.writeFile('test.txt', 'content');

			const exists = await engine.exists('test.txt');
			expect(exists).toBe(true);
		});

		it('should return false for nonexistent files', async () => {
			const exists = await engine.exists('nonexistent.txt');
			expect(exists).toBe(false);
		});

		it('should reject path traversal attempts', async () => {
			expect(() => engine['validatePath']('../etc/passwd')).toThrow(
				PathValidationError,
			);
		});
	});

	describe('delete', () => {
		it('should delete an existing file', async () => {
			await engine.writeFile('test.txt', 'content');
			expect(await engine.exists('test.txt')).toBe(true);

			await engine.delete('test.txt');
			expect(await engine.exists('test.txt')).toBe(false);
		});

		it('should throw FileNotFoundError for nonexistent files', async () => {
			await expect(engine.delete('nonexistent.txt')).rejects.toThrow(
				FileNotFoundError,
			);
		});

		it('should reject path traversal attempts', async () => {
			await expect(engine.delete('../etc/passwd')).rejects.toThrow(
				PathValidationError,
			);
		});
	});

	describe('listFiles', () => {
		it('should list files in a directory', async () => {
			await engine.writeFile('file1.txt', 'content1');
			await engine.writeFile('file2.txt', 'content2');
			await engine.writeFile('file3.md', 'content3');

			const files = await engine.listFiles('.');
			expect(files).toContain('file1.txt');
			expect(files).toContain('file2.txt');
			expect(files).toContain('file3.md');
		});

		it('should list files in a subdirectory', async () => {
			await engine.writeFile('dir/file1.txt', 'content1');
			await engine.writeFile('dir/file2.txt', 'content2');

			const files = await engine.listFiles('dir');
			expect(files.some((f) => f.includes('file1.txt'))).toBe(true);
			expect(files.some((f) => f.includes('file2.txt'))).toBe(true);
		});

		it('should list files recursively when requested', async () => {
			await engine.writeFile('dir1/file1.txt', 'content1');
			await engine.writeFile('dir1/subdir/file2.txt', 'content2');
			await engine.writeFile('dir2/file3.txt', 'content3');

			const files = await engine.listFiles('.', { recursive: true });
			expect(files).toContain('dir1/file1.txt');
			expect(files).toContain('dir1/subdir/file2.txt');
			expect(files).toContain('dir2/file3.txt');
		});

		it('should not list files recursively by default', async () => {
			await engine.writeFile('dir/file1.txt', 'content1');
			await engine.writeFile('dir/subdir/file2.txt', 'content2');

			const files = await engine.listFiles('dir');
			expect(files.some((f) => f.includes('file1.txt'))).toBe(true);
			expect(files.some((f) => f.includes('subdir'))).toBe(false);
		});

		it('should return empty array for empty directories', async () => {
			await mkdir(join(testDir, 'empty'), { recursive: true });

			const files = await engine.listFiles('empty');
			expect(files).toEqual([]);
		});

		it('should reject path traversal attempts', async () => {
			await expect(engine.listFiles('../etc')).rejects.toThrow(
				PathValidationError,
			);
		});
	});

	describe('getRootPath', () => {
		it('should return the root path', () => {
			expect(engine.getRootPath()).toBe(testDir);
		});
	});

	describe('Integration tests', () => {
		it('should handle write-read cycle correctly', async () => {
			const content = 'Integration test content';
			await engine.writeFile('integration/test.txt', content);

			const read = await engine.readFile('integration/test.txt');
			expect(read).toBe(content);
		});

		it('should handle multiple file operations', async () => {
			await engine.writeFile('file1.txt', 'content1');
			await engine.writeFile('file2.txt', 'content2');
			await engine.writeFile('dir/file3.txt', 'content3');

			const files = await engine.listFiles('.', { recursive: true });
			expect(files).toHaveLength(3);

			await engine.delete('file1.txt');
			const updated = await engine.listFiles('.', { recursive: true });
			expect(updated).toHaveLength(2);
		});
	});
});
