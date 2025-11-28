import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export interface LoadedTemplate {
	name: string;
	content: string;
	frontmatter: Record<string, string | string[]>;
}

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

function readProjectContextTemplate(): string {
	return readFileSync(
		path.join(currentDirectory, 'projectContext.md'),
		'utf8',
	);
}

function readActiveContextTemplate(): string {
	return readFileSync(
		path.join(currentDirectory, 'activeContext.md'),
		'utf8',
	);
}

function readProgressTemplate(): string {
	return readFileSync(path.join(currentDirectory, 'progress.md'), 'utf8');
}

function readDecisionLogTemplate(): string {
	return readFileSync(path.join(currentDirectory, 'decisionLog.md'), 'utf8');
}

function loadTemplate(templateName: string): LoadedTemplate {
	let content: string;

	try {
		switch (templateName) {
			case 'projectContext': {
				content = readProjectContextTemplate();
				break;
			}
			case 'activeContext': {
				content = readActiveContextTemplate();
				break;
			}
			case 'progress': {
				content = readProgressTemplate();
				break;
			}
			case 'decisionLog': {
				content = readDecisionLogTemplate();
				break;
			}
			default: {
				throw new Error(`Invalid template name: "${templateName}"`);
			}
		}

		return {
			name: templateName,
			content,
			frontmatter: {
				category: getCategoryForTemplate(templateName),
				created: new Date().toISOString(),
			},
		};
	} catch (error) {
		throw new Error(
			`Failed to load template "${templateName}": ${error instanceof Error ? error.message : 'Unknown error'}`,
		);
	}
}

export function loadAllTemplates(): LoadedTemplate[] {
	return [
		loadTemplate('projectContext'),
		loadTemplate('activeContext'),
		loadTemplate('progress'),
		loadTemplate('decisionLog'),
	];
}

function getCategoryForTemplate(templateName: string): string {
	const categories = new Map<string, string>([
		['projectContext', 'project-info'],
		['activeContext', 'active-work'],
		['progress', 'tracking'],
		['decisionLog', 'decisions'],
	]);

	return categories.get(templateName) ?? 'general';
}
