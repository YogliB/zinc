import { z } from 'zod';

export const DocsFrontmatterSchema = z.object({
	title: z.string().optional(),
	description: z.string().optional(),
	author: z.string().optional(),
	created: z.union([z.string(), z.date()]).optional(),
	updated: z.union([z.string(), z.date()]).optional(),
	tags: z.array(z.string()).optional(),
});

export type DocsFrontmatter = z.infer<typeof DocsFrontmatterSchema>;

export const DocsFileSchema = z.object({
	frontmatter: DocsFrontmatterSchema,
	content: z.string(),
});

export type DocsFile = z.infer<typeof DocsFileSchema>;

export function validateDocsFile(data: unknown): DocsFile {
	return DocsFileSchema.parse(data);
}
