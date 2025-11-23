import { z } from 'zod';

export const PlansFrontmatterSchema = z.object({
	title: z.string().optional(),
	status: z
		.enum(['draft', 'in-progress', 'completed', 'archived'])
		.optional(),
	created: z.union([z.string(), z.date()]).optional(),
	updated: z.union([z.string(), z.date()]).optional(),
	priority: z.enum(['low', 'medium', 'high']).optional(),
	tags: z.array(z.string()).optional(),
});

export type PlansFrontmatter = z.infer<typeof PlansFrontmatterSchema>;

export const PlansFileSchema = z.object({
	frontmatter: PlansFrontmatterSchema,
	content: z.string(),
});

export type PlansFile = z.infer<typeof PlansFileSchema>;

export function validatePlansFile(data: unknown): PlansFile {
	return PlansFileSchema.parse(data);
}
