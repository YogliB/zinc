import { StorageEngine } from '../../core/storage/engine';
import { parseMarkdown, stringifyMarkdown } from '../../core/storage/markdown';
import {
	RulesFileSchema,
	type RulesFile,
	type RulesFrontmatter,
} from '../../core/schemas/rules';
import { ValidationError, FileNotFoundError } from '../../core/storage/errors';

export interface RulesRepositoryOptions {
	storageEngine: StorageEngine;
	rulesPath?: string;
}

export class RulesRepository {
	private storageEngine: StorageEngine;
	private rulesPath: string;

	constructor(options: RulesRepositoryOptions) {
		this.storageEngine = options.storageEngine;
		this.rulesPath = options.rulesPath ?? 'zed-rules/AGENTS.md';
	}

	async getRules(): Promise<RulesFile> {
		try {
			const content = await this.storageEngine.readFile(this.rulesPath);
			const parsed = parseMarkdown(content);

			const rulesFile: RulesFile = {
				frontmatter: parsed.frontmatter,
				content: parsed.content,
			};

			const validated = RulesFileSchema.parse(rulesFile);
			return validated;
		} catch (error) {
			if (error instanceof FileNotFoundError) {
				throw error;
			}

			if (error instanceof ValidationError) {
				throw error;
			}

			throw new ValidationError(
				`Failed to load rules file: ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
		}
	}

	async saveRules(data: Partial<RulesFile>): Promise<void> {
		try {
			const frontmatter = data.frontmatter ?? {};
			const content = data.content ?? '';

			const rulesFile: RulesFile = {
				frontmatter,
				content,
			};

			const validated = RulesFileSchema.parse(rulesFile);
			const markdown = stringifyMarkdown(validated);

			await this.storageEngine.writeFile(this.rulesPath, markdown);
		} catch (error) {
			if (error instanceof ValidationError) {
				throw error;
			}

			throw new ValidationError(
				`Failed to save rules file: ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
		}
	}

	async updateRulesFrontmatter(
		frontmatter: Partial<RulesFrontmatter>,
	): Promise<void> {
		try {
			const current = await this.getRules();
			const updated: RulesFile = {
				frontmatter: { ...current.frontmatter, ...frontmatter },
				content: current.content,
			};
			await this.saveRules(updated);
		} catch (error) {
			throw new ValidationError(
				`Failed to update rules frontmatter: ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
		}
	}
}
