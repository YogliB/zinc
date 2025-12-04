import { describe, it, expect } from 'vitest';
import {
	PathValidationError,
	FileNotFoundError,
	WriteError,
	ValidationError,
} from '../../../../src/core/storage/errors';

describe('Storage Errors', () => {
	describe('PathValidationError', () => {
		it('should create error with message', () => {
			const error = new PathValidationError('Invalid path');
			expect(error.message).toBe('Invalid path');
			expect(error.name).toBe('PathValidationError');
			expect(error).toBeInstanceOf(Error);
		});
	});

	describe('FileNotFoundError', () => {
		it('should create error with file path', () => {
			const error = new FileNotFoundError('/path/to/file.txt');
			expect(error.message).toBe('File not found: /path/to/file.txt');
			expect(error.name).toBe('FileNotFoundError');
			expect(error).toBeInstanceOf(Error);
		});
	});

	describe('WriteError', () => {
		it('should create error with path and reason', () => {
			const error = new WriteError(
				'/path/to/file.txt',
				'Permission denied',
			);
			expect(error.message).toBe(
				'Failed to write file /path/to/file.txt: Permission denied',
			);
			expect(error.name).toBe('WriteError');
			expect(error).toBeInstanceOf(Error);
		});
	});

	describe('ValidationError', () => {
		it('should create error with message', () => {
			const error = new ValidationError('Invalid data format');
			expect(error.message).toBe('Invalid data format');
			expect(error.name).toBe('ValidationError');
			expect(error).toBeInstanceOf(Error);
		});
	});
});
