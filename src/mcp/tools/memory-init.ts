import { z } from 'zod';
import { MemoryRepository } from '../../layers/memory/repository';
import { ValidationError } from '../../core/storage/errors';
import { loadAllTemplates } from '../../layers/memory/templates/loader';

const MemoryInitInputSchema = z.object({}).optional();

export interface InitializationResult {
	success: boolean;
	message: string;
	filesCreated: string[];
	path: string;
	timestamp: string;
}

export function createMemoryInitTool(repository: MemoryRepository) {
	return {
		name: 'memory-init',
		description:
			'Initialize memory bank with four core template files (projectContext, activeContext, progress, decisionLog)',
		parameters: MemoryInitInputSchema,
		execute: async (): Promise<{
			type: 'text';
			text: string;
		}> => {
			console.error(
				'[DevFlow:INFO] Memory initialization tool called: memory-init',
			);

			try {
				const filesCreated: string[] = [];
				const timestamp = new Date().toISOString();

				const templates = await loadAllTemplates();

				for (const template of templates) {
					try {
						await repository.saveMemory(template.name, {
							frontmatter: template.frontmatter,
							content: template.content,
						});

						filesCreated.push(template.name);
						console.error(
							`[DevFlow:INFO] Memory initialization: created ${template.name}.md`,
						);
					} catch (error) {
						const errorMessage =
							error instanceof Error
								? error.message
								: 'Unknown error';
						console.error(
							`[DevFlow:WARN] Memory initialization: failed to create ${template.name}.md - ${errorMessage}`,
						);

						throw error;
					}
				}

				const result: InitializationResult = {
					success: true,
					message:
						'Memory bank initialized successfully with 4 core files',
					filesCreated,
					path: '.devflow/memory',
					timestamp,
				};

				console.error(
					`[DevFlow:INFO] Memory initialization succeeded: created ${filesCreated.length} files`,
				);

				return {
					type: 'text' as const,
					text: JSON.stringify(result, undefined, 2),
				};
			} catch (error) {
				if (error instanceof ValidationError) {
					console.error(
						`[DevFlow:ERROR] Memory initialization failed: ValidationError - ${error.message}`,
					);

					return {
						type: 'text' as const,
						text: JSON.stringify({
							success: false,
							error: 'Validation failed',
							message: error.message,
						}),
					};
				}

				const errorMessage =
					error instanceof Error ? error.message : 'Unknown error';
				console.error(
					`[DevFlow:ERROR] Memory initialization failed: ${errorMessage}`,
				);

				return {
					type: 'text' as const,
					text: JSON.stringify({
						success: false,
						error: 'Initialization failed',
						message: errorMessage,
					}),
				};
			}
		},
	};
}
