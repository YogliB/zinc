import { z } from 'zod';

export const DocumentationFrontmatterSchema = z.object({
	title: z.string().optional(),
	description: z.string().optional(),
	author: z.string().optional(),
	created: z.union([z.string(), z.date()]).optional(),
	updated: z.union([z.string(), z.date()]).optional(),
	tags: z.array(z.string()).optional(),
});

export type DocumentationFrontmatter = z.infer<
	typeof DocumentationFrontmatterSchema
>;

export const DocumentationFileSchema = z.object({
	frontmatter: DocumentationFrontmatterSchema,
	content: z.string(),
});

export type DocumentationFile = z.infer<typeof DocumentationFileSchema>;

export function validateDocumentationFile(data: unknown): DocumentationFile {
	return DocumentationFileSchema.parse(data);
}
