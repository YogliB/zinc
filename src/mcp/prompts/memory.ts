import { MemoryRepository } from '../../layers/memory/repository';
import { FileNotFoundError, ValidationError } from '../../core/storage/errors';
import type { Prompt } from 'fastmcp';

type SessionAuth = Record<string, unknown> | undefined;

export function createMemoryContextPrompt(
	repository: MemoryRepository,
): Prompt<SessionAuth> {
	return {
		name: 'memory:context',
		description:
			'Get combined memory context (activeContext + progress) - Zed workaround for auto-loaded resources',
		arguments: [],
		load: async (): Promise<string> => {
			console.error(
				'[DevFlow:INFO] Prompt called: memory:context (Zed workaround)',
			);

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
					'[DevFlow:INFO] Prompt operation succeeded: context (activeContext loaded)',
				);
			} catch (error) {
				if (error instanceof FileNotFoundError) {
					console.error(
						'[DevFlow:WARN] Prompt operation partial: activeContext.md missing, returning progress only',
					);
				} else {
					const errorMessage =
						error instanceof Error
							? error.message
							: 'Unknown error';
					console.error(
						`[DevFlow:WARN] Failed to load activeContext in prompt: ${errorMessage}`,
					);
				}
			}

			try {
				const progress = await repository.getMemory('progress');
				sections.push('# Progress\n', progress.content);
				console.error(
					'[DevFlow:INFO] Prompt operation succeeded: context (progress loaded)',
				);
			} catch (error) {
				if (error instanceof FileNotFoundError) {
					console.error(
						'[DevFlow:WARN] Prompt operation partial: progress.md missing, skipping',
					);
				} else {
					const errorMessage =
						error instanceof Error
							? error.message
							: 'Unknown error';
					console.error(
						`[DevFlow:WARN] Failed to load progress in prompt: ${errorMessage}`,
					);
				}
			}

			const combinedText =
				sections.length > 0
					? sections.join('\n')
					: '# Memory Bank Context\n\nNo memory files found.';

			return combinedText;
		},
	};
}

interface MemoryLoadPromptArguments {
	name: string;
}

export function createMemoryLoadPrompt(
	repository: MemoryRepository,
): Prompt<
	SessionAuth,
	[{ name: 'name'; description: string; required: true }]
> {
	return {
		name: 'memory:load',
		description:
			'Load a specific memory file by name - Zed workaround for dynamic resources',
		arguments: [
			{
				name: 'name',
				description: 'Name of the memory file to retrieve',
				required: true,
			},
		],
		load: async (
			arguments_: MemoryLoadPromptArguments,
		): Promise<string> => {
			const { name } = arguments_;
			console.error(
				`[DevFlow:INFO] Prompt called: memory:load with args: { name: "${name}" }`,
			);

			try {
				const memory = await repository.getMemory(name);

				const frontmatterLines: string[] = [];
				if (
					memory.frontmatter &&
					Object.keys(memory.frontmatter).length > 0
				) {
					frontmatterLines.push('---');
					for (const [key, value] of Object.entries(
						memory.frontmatter,
					)) {
						frontmatterLines.push(
							`${key}: ${JSON.stringify(value)}`,
						);
					}
					frontmatterLines.push('---', '');
				}

				const text =
					frontmatterLines.length > 0
						? frontmatterLines.join('\n') + memory.content
						: memory.content;

				console.error(
					`[DevFlow:INFO] Prompt operation succeeded: memory file "${name}"`,
				);

				return text;
			} catch (error) {
				if (error instanceof FileNotFoundError) {
					console.error(
						`[DevFlow:ERROR] Prompt failed: memory:load - FileNotFoundError: Memory "${name}" not found`,
					);
					return `# Error: Memory Not Found\n\nMemory file "${name}" could not be found in the memory bank.`;
				}

				if (error instanceof ValidationError) {
					console.error(
						`[DevFlow:ERROR] Prompt failed: memory:load - ValidationError: ${error.message}`,
					);
					return `# Error: Invalid Memory Name\n\n${error.message}`;
				}

				const errorMessage =
					error instanceof Error ? error.message : 'Unknown error';
				console.error(
					`[DevFlow:ERROR] Prompt failed: memory:load - Error: ${errorMessage}`,
				);
				return `# Error: Failed to Load Memory\n\n${errorMessage}`;
			}
		},
	};
}

export { createMemoryUpdatePrompt } from './memory-update';
