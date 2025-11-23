import { describe, it, expect } from 'vitest';
import { parseMarkdown, stringifyMarkdown } from './markdown';

describe('Markdown Parser', () => {
	describe('parseMarkdown', () => {
		it('should parse frontmatter and content', () => {
			const input = `---
title: Test
author: John Doe
---

This is the content.`;

			const result = parseMarkdown(input);
			expect(result.frontmatter.title).toContain('Test');
			expect(result.frontmatter.author).toContain('John Doe');
			expect(result.content).toBe('This is the content.');
		});

		it('should handle empty frontmatter', () => {
			const input = `---
---

Content without frontmatter data.`;

			const result = parseMarkdown(input);
			expect(result.frontmatter).toEqual({});
			expect(result.content).toBe('Content without frontmatter data.');
		});

		it('should handle content without frontmatter', () => {
			const input = 'Just plain content';

			const result = parseMarkdown(input);
			expect(result.frontmatter).toEqual({});
			expect(result.content).toBe('Just plain content');
		});

		it('should parse array values in frontmatter', () => {
			const input = `---
tags:
  - tag1
  - tag2
  - tag3
---

Content here.`;

			const result = parseMarkdown(input);
			expect(Array.isArray(result.frontmatter.tags)).toBe(true);
			expect(result.frontmatter.tags).toEqual(['tag1', 'tag2', 'tag3']);
		});

		it('should parse datetime values', () => {
			const input = `---
created: "2024-01-15T10:30:00Z"
updated: "2024-01-16T14:45:00Z"
---

Content here.`;

			const result = parseMarkdown(input);
			expect(result.frontmatter.created).toBe('2024-01-15T10:30:00Z');
			expect(result.frontmatter.updated).toBe('2024-01-16T14:45:00Z');
		});

		it('should handle multiline strings in frontmatter', () => {
			const input = `---
description: |
  This is a multiline
  description that spans
  multiple lines.
---

Content here.`;

			const result = parseMarkdown(input);
			expect(typeof result.frontmatter.description).toBe('string');
			expect(result.frontmatter.description).toContain('multiline');
		});

		it('should trim content whitespace', () => {
			const input = `---
title: Test
---

   Content with leading spaces

Trailing whitespace here.   `;

			const result = parseMarkdown(input);
			expect(result.content).not.toMatch(/^\s+/);
		});

		it('should preserve internal formatting', () => {
			const input = `---
title: Test
---

# Heading

- Item 1
- Item 2

**Bold text** and *italic text*.`;

			const result = parseMarkdown(input);
			expect(result.content).toContain('# Heading');
			expect(result.content).toContain('**Bold text**');
			expect(result.content).toContain('*italic text*');
		});
	});

	describe('stringifyMarkdown', () => {
		it('should stringify frontmatter and content', () => {
			const file = {
				frontmatter: {
					title: 'Test',
					author: 'John Doe',
				},
				content: 'This is the content.',
			};

			const result = stringifyMarkdown(file);
			expect(result).toContain('---');
			expect(result).toContain('title: Test');
			expect(result).toContain('author: John Doe');
			expect(result).toContain('This is the content.');
		});

		it('should handle empty frontmatter', () => {
			const file = {
				frontmatter: {},
				content: 'Just content.',
			};

			const result = stringifyMarkdown(file);
			expect(result).toBe('Just content.');
		});

		it('should handle no frontmatter gracefully', () => {
			const file = {
				frontmatter: {} as Record<string, unknown>,
				content: 'Plain content.',
			};

			const result = stringifyMarkdown(file);
			expect(result).toBe('Plain content.');
		});

		it('should stringify array values', () => {
			const file = {
				frontmatter: {
					tags: ['tag1', 'tag2', 'tag3'],
				},
				content: 'Content here.',
			};

			const result = stringifyMarkdown(file);
			expect(result).toContain('tags:');
		});

		it('should handle object values as JSON', () => {
			const file = {
				frontmatter: {
					config: {
						nested: 'value',
					},
				},
				content: 'Content here.',
			};

			const result = stringifyMarkdown(file);
			expect(result).toContain('config:');
		});

		it('should properly format multiline strings', () => {
			const file = {
				frontmatter: {
					description: 'This is a\nmultiline\nstring',
				},
				content: 'Content here.',
			};

			const result = stringifyMarkdown(file);
			expect(result).toContain('description: |');
		});

		it('should handle strings with quotes', () => {
			const file = {
				frontmatter: {
					quote: 'He said "hello"',
				},
				content: 'Content here.',
			};

			const result = stringifyMarkdown(file);
			expect(result).toContain('quote: "He said \\"hello\\""');
		});

		it('should handle null and undefined values', () => {
			const file = {
				frontmatter: {
					empty: null,
					undef: undefined,
				},
				content: 'Content here.',
			};

			const result = stringifyMarkdown(file);
			expect(result).toContain('---');
		});
	});

	describe('Round-trip tests', () => {
		it('should parse and stringify consistently', () => {
			const original = `---
title: Test Article
author: Jane Doe
tags:
  - markdown
  - testing
---

# Main Heading

This is a test article with some content.

- List item 1
- List item 2

**Bold text** and *italic text*.`;

			const parsed = parseMarkdown(original);
			const stringified = stringifyMarkdown(parsed);
			const reparsed = parseMarkdown(stringified);

			expect(reparsed.frontmatter.title).toBe(parsed.frontmatter.title);
			expect(reparsed.content).toContain('Main Heading');
		});

		it('should preserve content through multiple cycles', () => {
			const file = {
				frontmatter: {
					title: 'Persistent Title',
					version: '1.0',
				},
				content: 'Persistent content that should not change.',
			};

			let current = stringifyMarkdown(file);
			for (let i = 0; i < 3; i++) {
				const parsed = parseMarkdown(current);
				current = stringifyMarkdown(parsed);
			}

			const final = parseMarkdown(current);
			expect(final.frontmatter.title).toBe('Persistent Title');
			expect(final.content).toBe(
				'Persistent content that should not change.',
			);
		});
	});
});
