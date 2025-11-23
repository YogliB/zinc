import { z } from 'zod';
import { MemoryRepository } from '../../layers/memory/repository';
import { FileNotFoundError, ValidationError } from '../../core/storage/errors';

const MemoryGetInputSchema = z.object({
	name: z.string().min(1, 'Memory name must not be empty'),
});

type MemoryGetInput = z.infer<typeof MemoryGetInputSchema>;

export function createMemoryGetTool(repository: MemoryRepository) {
	return {
		name: 'memory:get',
		description: 'Get a memory file by name',
		parameters: MemoryGetInputSchema,
		execute: async (input: MemoryGetInput) => {
			const { name } = input;
			console.error(
				`[DevFlow:INFO] Memory tool called: memory:get with input: { name: "${name}" }`,
			);

			try {
				const memory = await repository.getMemory(name);
				console.error(
					`[DevFlow:INFO] Memory operation succeeded: get for ${name}`,
				);
				return {
					type: 'text' as const,
					text: JSON.stringify({
						frontmatter: memory.frontmatter,
						content: memory.content,
					}),
				};
			} catch (error) {
				if (error instanceof FileNotFoundError) {
					console.error(
						`[DevFlow:ERROR] Memory tool failed: memory:get - FileNotFoundError: ${error.message}`,
					);
					return {
						type: 'text' as const,
						text: JSON.stringify({
							error: 'Memory not found',
							name,
						}),
					};
				}

				if (error instanceof ValidationError) {
					console.error(
						`[DevFlow:ERROR] Memory tool failed: memory:get - ValidationError: ${error.message}`,
					);
					return {
						type: 'text' as const,
						text: JSON.stringify({
							error: 'Invalid memory file',
							message: error.message,
						}),
					};
				}

				const errorMessage =
					error instanceof Error ? error.message : 'Unknown error';
				console.error(
					`[DevFlow:ERROR] Memory tool failed: memory:get - Error: ${errorMessage}`,
				);
				return {
					type: 'text' as const,
					text: JSON.stringify({
						error: 'Failed to get memory',
						message: errorMessage,
					}),
				};
			}
		},
	};
}

const MemorySaveInputSchema = z.object({
	name: z.string().min(1, 'Memory name must not be empty'),
	frontmatter: z.record(z.string(), z.any()).optional(),
	content: z.string(),
});

type MemorySaveInput = z.infer<typeof MemorySaveInputSchema>;

export function createMemorySaveTool(repository: MemoryRepository) {
	return {
		name: 'memory:save',
		description: 'Save or update a memory file',
		parameters: MemorySaveInputSchema,
		execute: async (input: MemorySaveInput) => {
			const { name, frontmatter, content } = input;
			console.error(
				`[DevFlow:INFO] Memory tool called: memory:save with input: { name: "${name}", content: ${content.length} chars }`,
			);

			try {
				await repository.saveMemory(name, {
					frontmatter: frontmatter ?? {},
					content,
				});
				console.error(
					`[DevFlow:INFO] Memory operation succeeded: save for ${name}`,
				);
				return {
					type: 'text' as const,
					text: JSON.stringify({
						success: true,
						message: 'Memory saved',
						name,
					}),
				};
			} catch (error) {
				if (error instanceof ValidationError) {
					console.error(
						`[DevFlow:ERROR] Memory tool failed: memory:save - ValidationError: ${error.message}`,
					);
					return {
						type: 'text' as const,
						text: JSON.stringify({
							error: 'Validation failed',
							message: error.message,
						}),
					};
				}

				const errorMessage =
					error instanceof Error ? error.message : 'Unknown error';
				console.error(
					`[DevFlow:ERROR] Memory tool failed: memory:save - Error: ${errorMessage}`,
				);
				return {
					type: 'text' as const,
					text: JSON.stringify({
						error: 'Failed to save memory',
						message: errorMessage,
					}),
				};
			}
		},
	};
}

const MemoryListInputSchema = z.object({}).optional();

export function createMemoryListTool(repository: MemoryRepository) {
	return {
		name: 'memory:list',
		description: 'List all memory files in the memory bank',
		parameters: MemoryListInputSchema,
		execute: async () => {
			console.error(`[DevFlow:INFO] Memory tool called: memory:list`);

			try {
				const memories = await repository.listMemories();
				console.error(
					`[DevFlow:INFO] Memory operation succeeded: list (found ${memories.length} memories)`,
				);
				return {
					type: 'text' as const,
					text: JSON.stringify({
						memories,
						count: memories.length,
					}),
				};
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'Unknown error';
				console.error(
					`[DevFlow:ERROR] Memory tool failed: memory:list - Error: ${errorMessage}`,
				);
				return {
					type: 'text' as const,
					text: JSON.stringify({
						error: 'Failed to list memories',
						message: errorMessage,
					}),
				};
			}
		},
	};
}

const MemoryDeleteInputSchema = z.object({
	name: z.string().min(1, 'Memory name must not be empty'),
});

type MemoryDeleteInput = z.infer<typeof MemoryDeleteInputSchema>;

export function createMemoryDeleteTool(repository: MemoryRepository) {
	return {
		name: 'memory:delete',
		description: 'Delete a memory file by name',
		parameters: MemoryDeleteInputSchema,
		execute: async (input: MemoryDeleteInput) => {
			const { name } = input;
			console.error(
				`[DevFlow:INFO] Memory tool called: memory:delete with input: { name: "${name}" }`,
			);

			try {
				await repository.deleteMemory(name);
				console.error(
					`[DevFlow:INFO] Memory operation succeeded: delete for ${name}`,
				);
				return {
					type: 'text' as const,
					text: JSON.stringify({
						success: true,
						message: 'Memory deleted',
						name,
					}),
				};
			} catch (error) {
				if (error instanceof FileNotFoundError) {
					console.error(
						`[DevFlow:ERROR] Memory tool failed: memory:delete - FileNotFoundError: ${error.message}`,
					);
					return {
						type: 'text' as const,
						text: JSON.stringify({
							error: 'Memory not found',
							name,
						}),
					};
				}

				const errorMessage =
					error instanceof Error ? error.message : 'Unknown error';
				console.error(
					`[DevFlow:ERROR] Memory tool failed: memory:delete - Error: ${errorMessage}`,
				);
				return {
					type: 'text' as const,
					text: JSON.stringify({
						error: 'Failed to delete memory',
						message: errorMessage,
					}),
				};
			}
		},
	};
}
