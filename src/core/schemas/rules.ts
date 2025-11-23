import { z } from 'zod';

export const RulesFrontmatterSchema = z.object({
	title: z.string().optional(),
	version: z.string().optional(),
	updated: z.union([z.string(), z.date()]).optional(),
});

export type RulesFrontmatter = z.infer<typeof RulesFrontmatterSchema>;

export const RulesFileSchema = z.object({
	frontmatter: RulesFrontmatterSchema,
	content: z.string(),
});

export type RulesFile = z.infer<typeof RulesFileSchema>;

export function validateRulesFile(data: unknown): RulesFile {
	return RulesFileSchema.parse(data);
}
