import path from 'path';
import { StorageEngine } from '../../core/storage/engine';
import { parseMarkdown, stringifyMarkdown } from '../../core/storage/markdown';
import {
	PlansFileSchema,
	type PlansFile,
	type PlansFrontmatter,
} from '../../core/schemas/plans';
import { ValidationError, FileNotFoundError } from '../../core/storage/errors';

export interface PlansRepositoryOptions {
	storageEngine: StorageEngine;
	plansPath?: string;
}

export class PlansRepository {
	private storageEngine: StorageEngine;
	private plansPath: string;

	constructor(options: PlansRepositoryOptions) {
		this.storageEngine = options.storageEngine;
		this.plansPath = options.plansPath ?? 'docs/plans';
	}

	private buildPlansPath(name: string): string {
		const normalized = path.normalize(name);

		if (path.isAbsolute(normalized) || normalized.startsWith('..')) {
			throw new ValidationError(
				`Invalid plan name "${name}": path traversal is not allowed`,
			);
		}

		return `${this.plansPath}/${normalized}.md`;
	}

	async getPlan(name: string): Promise<PlansFile> {
		const filePath = this.buildPlansPath(name);

		try {
			const content = await this.storageEngine.readFile(filePath);
			const parsed = parseMarkdown(content);

			const plansFile: PlansFile = {
				frontmatter: parsed.frontmatter,
				content: parsed.content,
			};

			const validated = PlansFileSchema.parse(plansFile);
			return validated;
		} catch (error) {
			if (error instanceof FileNotFoundError) {
				throw error;
			}

			if (error instanceof ValidationError) {
				throw error;
			}

			throw new ValidationError(
				`Failed to load plan file "${name}": ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
		}
	}

	async savePlan(name: string, data: Partial<PlansFile>): Promise<void> {
		try {
			const frontmatter = data.frontmatter ?? {};
			const content = data.content ?? '';

			const plansFile: PlansFile = {
				frontmatter,
				content,
			};

			const validated = PlansFileSchema.parse(plansFile);
			const markdown = stringifyMarkdown(validated);
			const filePath = this.buildPlansPath(name);

			await this.storageEngine.writeFile(filePath, markdown);
		} catch (error) {
			if (error instanceof ValidationError) {
				throw error;
			}

			throw new ValidationError(
				`Failed to save plan file "${name}": ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
		}
	}

	async listPlans(): Promise<string[]> {
		try {
			const files = await this.storageEngine.listFiles(this.plansPath, {
				recursive: true,
			});
			return files
				.filter((file) => file.endsWith('.md'))
				.map((file) => {
					const relativePath = path.relative(this.plansPath, file);
					return relativePath.replace(/\.md$/, '');
				});
		} catch (error) {
			throw new ValidationError(
				`Failed to list plans: ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
		}
	}

	async deletePlan(name: string): Promise<void> {
		try {
			const filePath = this.buildPlansPath(name);
			await this.storageEngine.delete(filePath);
		} catch (error) {
			if (error instanceof FileNotFoundError) {
				throw error;
			}

			throw new ValidationError(
				`Failed to delete plan file "${name}": ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
		}
	}

	async createPlan(
		name: string,
		frontmatter?: PlansFrontmatter,
		content = '',
	): Promise<void> {
		const plansFile: PlansFile = {
			frontmatter: frontmatter ?? {},
			content,
		};
		await this.savePlan(name, plansFile);
	}
}
