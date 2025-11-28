import { z } from 'zod';
import { MemoryRepository } from '../../layers/memory/repository';
import { FileNotFoundError, ValidationError } from '../../core/storage/errors';

function getFileDisplayName(fileName: string): string {
	const names = new Map<string, string>([
		['projectContext', 'Project Context'],
		['activeContext', 'Active Context'],
		['progress', 'Progress'],
		['decisionLog', 'Decision Log'],
	]);

	return names.get(fileName) ?? fileName;
}

const MemoryGetInputSchema = z.object({
	name: z.string().min(1, 'Memory name must not be empty'),
});

type MemoryGetInput = z.infer<typeof MemoryGetInputSchema>;

export function createMemoryGetTool(repository: MemoryRepository) {
	return {
		name: 'memory-get',
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
		name: 'memory-save',
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
		name: 'memory-list',
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
		name: 'memory-delete',
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

const MemoryContextInputSchema = z.object({}).optional();

export function createMemoryContextTool(repository: MemoryRepository) {
	return {
		name: 'memory-context',
		description:
			'Get combined memory context (activeContext + progress) for current session',
		parameters: MemoryContextInputSchema,
		execute: async () => {
			console.error(`[DevFlow:INFO] Memory tool called: memory-context`);

			const sections: string[] = [];

			try {
				const activeContext =
					await repository.getMemory('activeContext');
				sections.push(
					'# Active Context\n',
					activeContext.content,
					'\n',
				);
				console.error(
					`[DevFlow:INFO] Memory operation: context (activeContext loaded)`,
				);
			} catch (error) {
				if (error instanceof FileNotFoundError) {
					console.error(
						`[DevFlow:WARN] Memory operation partial: activeContext.md missing`,
					);
				} else {
					const errorMessage =
						error instanceof Error
							? error.message
							: 'Unknown error';
					console.error(
						`[DevFlow:WARN] Failed to load activeContext: ${errorMessage}`,
					);
				}
			}

			try {
				const progress = await repository.getMemory('progress');
				sections.push('# Progress\n', progress.content);
				console.error(
					`[DevFlow:INFO] Memory operation: context (progress loaded)`,
				);
			} catch (error) {
				if (error instanceof FileNotFoundError) {
					console.error(
						`[DevFlow:WARN] Memory operation partial: progress.md missing`,
					);
				} else {
					const errorMessage =
						error instanceof Error
							? error.message
							: 'Unknown error';
					console.error(
						`[DevFlow:WARN] Failed to load progress: ${errorMessage}`,
					);
				}
			}

			const combinedText =
				sections.length > 0
					? sections.join('\n')
					: '# Memory Bank Context\n\nNo memory files found. Use memory-init to create them.';

			console.error(`[DevFlow:INFO] Memory operation succeeded: context`);

			return {
				type: 'text' as const,
				text: combinedText,
			};
		},
	};
}

const MemoryUpdateInputSchema = z.object({}).optional();

export function createMemoryUpdateTool(repository: MemoryRepository) {
	return {
		name: 'memory-update',
		description: 'Review all memory bank files with guided update workflow',
		parameters: MemoryUpdateInputSchema,
		execute: async () => {
			console.error(`[DevFlow:INFO] Memory tool called: memory-update`);

			const sections: string[] = [
				'# Memory Bank Update Workflow',
				'',
				'Your task: Review all memory files and update them to reflect current project state.',
				'',
				'## Update Process',
				'',
				"1. **Review ALL files** - Read each memory file below, even if some don't need updates",
				"2. **Document Current State** - Capture what's happening right now",
				'3. **Clarify Next Steps** - Identify immediate priorities and blockers',
				'4. **Document Insights** - Record patterns, lessons learned, and decisions',
				'',
				'## Focus Areas',
				'',
				'Pay particular attention to:',
				'- **activeContext.md**: Is current work accurately captured?',
				'- **progress.md**: Are milestones and metrics up to date?',
				'- **projectContext.md**: Have scope or constraints changed?',
				'- **decisionLog.md**: Any new architectural decisions?',
				'',
				'---',
				'',
			];

			const filesToLoad = [
				'projectContext',
				'activeContext',
				'progress',
				'decisionLog',
			];

			let filesLoaded = 0;
			const failedFiles: string[] = [];

			for (const fileName of filesToLoad) {
				try {
					const memory = await repository.getMemory(fileName);
					sections.push(
						`## ${getFileDisplayName(fileName)}`,
						'',
						'```markdown',
						memory.content,
						'```',
						'',
					);
					filesLoaded++;
					console.error(
						`[DevFlow:INFO] Memory operation: loaded ${fileName}`,
					);
				} catch (error) {
					if (error instanceof FileNotFoundError) {
						console.error(
							`[DevFlow:WARN] Memory operation partial: ${fileName}.md missing`,
						);
						failedFiles.push(fileName);
						sections.push(
							`## ${getFileDisplayName(fileName)} (Not Found)`,
							'',
							`*Note: ${fileName}.md does not exist yet. Use memory-init to create it or memory-save to initialize it.*`,
							'',
						);
					} else {
						const errorMessage =
							error instanceof Error
								? error.message
								: 'Unknown error';
						console.error(
							`[DevFlow:WARN] Memory operation partial: failed to load ${fileName} - ${errorMessage}`,
						);
						failedFiles.push(fileName);
						sections.push(
							`## ${getFileDisplayName(fileName)} (Error Loading)`,
							'',
							`*Note: Could not load ${fileName}.md - ${errorMessage}*`,
							'',
						);
					}
				}
			}

			sections.push(
				'---',
				'',
				'## What to Update',
				'',
				'### For Each File:',
				'',
				'**projectContext.md:**',
				'- [ ] Project description is accurate',
				'- [ ] Scope reflects reality (what changed?)',
				'- [ ] Constraints are current',
				'- [ ] Technology stack is correct',
				'- [ ] Status and health are up-to-date',
				'',
				'**activeContext.md:**',
				"- [ ] Current focus accurately describes what's being worked on NOW",
				'- [ ] All active blockers are listed with current status',
				'- [ ] Recent changes (last 7 days) are documented',
				'- [ ] Context notes reflect important patterns or considerations',
				'- [ ] Next steps are clear priorities',
				'',
				'**progress.md:**',
				'- [ ] Current milestone status is accurate',
				'- [ ] Task completion status is up-to-date',
				'- [ ] Metrics (velocity, resolution time) are current',
				'- [ ] Known issues reflect real problems',
				'- [ ] Lessons learned are documented',
				'- [ ] Archive old entries (>30 days)',
				'',
				'**decisionLog.md:**',
				'- [ ] Recent decisions are documented',
				'- [ ] Each decision has context, rationale, and alternatives',
				'- [ ] Status of decisions (Accepted/Pending/Superseded) is correct',
				'- [ ] Any decisions that need revisiting are noted',
				'',
				'## Next Steps After Review',
				'',
				'After reviewing, update files using memory-save tool:',
				'',
				'```json',
				'{',
				'  "name": "activeContext",',
				'  "content": "# Updated content...",',
				'  "frontmatter": {',
				'    "category": "active-work",',
				'    "updated": "2024-03-20T14:30:00Z"',
				'  }',
				'}',
				'```',
				'',
				'Use memory-list to see all files, memory-get to retrieve specific files.',
				'',
				'## Tips',
				'',
				'- **Be specific:** Use dates, file names, and concrete examples',
				'- **Link decisions:** Reference decision numbers when relevant',
				'- **Archive old work:** Move entries >30 days old from activeContext to progress',
				'- **Update timestamps:** Mark when updates occur',
				'- **Document blockers:** Severity, impact, and workarounds',
				'- **Track metrics:** Velocity helps predict future milestones',
				'',
			);

			const missingFilesSuffix =
				failedFiles.length > 0
					? ` (missing: ${failedFiles.join(', ')})`
					: '';
			const successMessage = `Successfully loaded ${filesLoaded}/${filesToLoad.length} memory files${missingFilesSuffix}`;
			const summary =
				filesLoaded > 0
					? successMessage
					: 'No memory files found. Use memory-init to create them.';

			console.error(
				`[DevFlow:INFO] Memory operation succeeded: update loaded ${filesLoaded} files`,
			);

			sections.push(
				'---',
				'',
				`**Status:** ${summary}`,
				'',
				'Begin by reviewing the memory files above, then use the memory-save tool to update them.',
			);

			return {
				type: 'text' as const,
				text: sections.join('\n'),
			};
		},
	};
}

export { createMemoryInitTool } from './memory-init';
