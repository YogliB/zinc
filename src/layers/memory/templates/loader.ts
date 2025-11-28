import projectContextTemplate from './projectContext.md' with { type: 'file' };
import activeContextTemplate from './activeContext.md' with { type: 'file' };
import progressTemplate from './progress.md' with { type: 'file' };
import decisionLogTemplate from './decisionLog.md' with { type: 'file' };
import { file } from 'bun';

export interface LoadedTemplate {
	name: string;
	content: string;
	frontmatter: Record<string, string | string[]>;
}

async function readProjectContextTemplate(): Promise<string> {
	return await file(projectContextTemplate).text();
}

async function readActiveContextTemplate(): Promise<string> {
	return await file(activeContextTemplate).text();
}

async function readProgressTemplate(): Promise<string> {
	return await file(progressTemplate).text();
}

async function readDecisionLogTemplate(): Promise<string> {
	return await file(decisionLogTemplate).text();
}

export async function loadTemplate(
	templateName: string,
): Promise<LoadedTemplate> {
	let content: string;

	try {
		switch (templateName) {
			case 'projectContext': {
				content = await readProjectContextTemplate();
				break;
			}
			case 'activeContext': {
				content = await readActiveContextTemplate();
				break;
			}
			case 'progress': {
				content = await readProgressTemplate();
				break;
			}
			case 'decisionLog': {
				content = await readDecisionLogTemplate();
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

export async function loadAllTemplates(): Promise<LoadedTemplate[]> {
	return await Promise.all([
		loadTemplate('projectContext'),
		loadTemplate('activeContext'),
		loadTemplate('progress'),
		loadTemplate('decisionLog'),
	]);
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
