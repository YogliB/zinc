import { describe, it, expect } from 'vitest';
import {
	detectLanguage,
	isSupportedLanguage,
} from '../../../../../src/core/analysis/utils/language-detector';

describe('language-detector', () => {
	describe('detectLanguage', () => {
		it('should detect TypeScript files', () => {
			expect(detectLanguage('file.ts')).toBe('typescript');
			expect(detectLanguage('file.tsx')).toBe('typescript');
			expect(detectLanguage('/path/to/file.ts')).toBe('typescript');
			expect(detectLanguage('/path/to/file.tsx')).toBe('typescript');
		});

		it('should detect JavaScript files', () => {
			expect(detectLanguage('file.js')).toBe('javascript');
			expect(detectLanguage('file.jsx')).toBe('javascript');
			expect(detectLanguage('file.mjs')).toBe('javascript');
			expect(detectLanguage('file.cjs')).toBe('javascript');
			expect(detectLanguage('/path/to/file.js')).toBe('javascript');
		});

		it('should handle case insensitivity', () => {
			expect(detectLanguage('file.TS')).toBe('typescript');
			expect(detectLanguage('file.JS')).toBe('javascript');
			expect(detectLanguage('file.TsX')).toBe('typescript');
		});

		it('should return unknown for unsupported extensions', () => {
			expect(detectLanguage('file.py')).toBe('unknown');
			expect(detectLanguage('file.java')).toBe('unknown');
			expect(detectLanguage('file')).toBe('unknown');
			expect(detectLanguage('file.')).toBe('unknown');
		});

		it('should handle files without extensions', () => {
			expect(detectLanguage('file')).toBe('unknown');
			expect(detectLanguage('/path/to/file')).toBe('unknown');
		});
	});

	describe('isSupportedLanguage', () => {
		it('should return true for supported languages', () => {
			expect(isSupportedLanguage('file.ts')).toBe(true);
			expect(isSupportedLanguage('file.tsx')).toBe(true);
			expect(isSupportedLanguage('file.js')).toBe(true);
			expect(isSupportedLanguage('file.jsx')).toBe(true);
			expect(isSupportedLanguage('file.mjs')).toBe(true);
			expect(isSupportedLanguage('file.cjs')).toBe(true);
		});

		it('should return false for unsupported languages', () => {
			expect(isSupportedLanguage('file.py')).toBe(false);
			expect(isSupportedLanguage('file.java')).toBe(false);
			expect(isSupportedLanguage('file')).toBe(false);
		});
	});
});
