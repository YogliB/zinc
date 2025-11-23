import { z } from 'zod';

export const MemoryFrontmatterSchema = z.object({
	title: z.string().optional(),
	created: z.union([z.string(), z.date()]).optional(),
	updated: z.union([z.string(), z.date()]).optional(),
	tags: z.array(z.string()).optional(),
	category: z.string().optional(),
});

export type MemoryFrontmatter = z.infer<typeof MemoryFrontmatterSchema>;

export const MemoryFileSchema = z.object({
	frontmatter: MemoryFrontmatterSchema,
	content: z.string(),
});

export type MemoryFile = z.infer<typeof MemoryFileSchema>;

export function validateMemoryFile(data: unknown): MemoryFile {
	return MemoryFileSchema.parse(data);
}
