export interface MemoryTemplate {
	name: string;
	fileName: string;
	description: string;
	frontmatter: Record<string, string>;
}

export const MEMORY_TEMPLATES: Record<string, MemoryTemplate> = {
	activeContext: {
		name: 'activeContext',
		fileName: 'activeContext.md',
		description:
			'Current work focus, active blockers, and recent changes (last 7 days)',
		frontmatter: {
			category: 'active-work',
			updated: new Date().toISOString(),
		},
	},
	progress: {
		name: 'progress',
		fileName: 'progress.md',
		description:
			'Completed work, current milestones, metrics, and lessons learned',
		frontmatter: {
			category: 'tracking',
			created: new Date().toISOString(),
			updated: new Date().toISOString(),
		},
	},
	decisionLog: {
		name: 'decisionLog',
		fileName: 'decisionLog.md',
		description:
			'Architectural decisions with rationale, alternatives, and consequences',
		frontmatter: {
			category: 'decisions',
			updated: new Date().toISOString(),
		},
	},
	projectContext: {
		name: 'projectContext',
		fileName: 'projectContext.md',
		description:
			'High-level project overview, scope, constraints, and technology stack',
		frontmatter: {
			category: 'project-info',
			created: new Date().toISOString(),
			updated: new Date().toISOString(),
		},
	},
};

export function getTemplateNames(): string[] {
	return Object.keys(MEMORY_TEMPLATES);
}

export function getTemplate(name: string): MemoryTemplate | undefined {
	return MEMORY_TEMPLATES[name as keyof typeof MEMORY_TEMPLATES];
}
