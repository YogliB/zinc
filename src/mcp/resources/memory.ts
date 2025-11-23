import { MemoryRepository } from '../../layers/memory/repository';
import { FileNotFoundError, ValidationError } from '../../core/storage/errors';
import type { Resource, ResourceTemplate, ResourceResult } from 'fastmcp';

type SessionAuth = Record<string, unknown> | undefined;

export function createContextResource(
	repository: MemoryRepository,
): Resource<SessionAuth> {
	return {
		uri: 'devflow://context/memory',
		name: 'Memory Bank Context',
		description:
			'Auto-loaded context from activeContext and progress files',
		mimeType: 'text/markdown',
		load: async (): Promise<ResourceResult | ResourceResult[]> => {
			console.error(
				'[DevFlow:INFO] Resource called: devflow://context/memory',
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
					'[DevFlow:INFO] Resource operation succeeded: context (activeContext loaded)',
				);
			} catch (error) {
				if (error instanceof FileNotFoundError) {
					console.error(
						'[DevFlow:WARN] Resource operation partial: activeContext.md missing, returning progress only',
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
					'[DevFlow:INFO] Resource operation succeeded: context (progress loaded)',
				);
			} catch (error) {
				if (error instanceof FileNotFoundError) {
					console.error(
						'[DevFlow:WARN] Resource operation partial: progress.md missing, skipping',
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
					: '# Memory Bank Context\n\nNo memory files found.';

			return {
				text: combinedText,
				mimeType: 'text/markdown',
				uri: 'devflow://context/memory',
			};
		},
	};
}

interface MemoryResourceArguments {
	name: string;
}

export function createMemoryResourceTemplate(
	repository: MemoryRepository,
): ResourceTemplate<
	SessionAuth,
	[{ name: 'name'; description: string; required: true }]
> {
	return {
		uriTemplate: 'devflow://memory/{name}',
		name: 'Memory File',
		description: 'Access individual memory file by name',
		mimeType: 'text/markdown',
		arguments: [
			{
				name: 'name',
				description: 'Name of the memory file to retrieve',
				required: true,
			},
		],
		load: async (
			arguments_: MemoryResourceArguments,
		): Promise<ResourceResult | ResourceResult[]> => {
			const { name } = arguments_;
			console.error(
				`[DevFlow:INFO] Resource called: devflow://memory/{name} with args: { name: "${name}" }`,
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
					`[DevFlow:INFO] Resource operation succeeded: memory file "${name}"`,
				);

				return {
					text,
					mimeType: 'text/markdown',
					uri: `devflow://memory/${name}`,
				};
			} catch (error) {
				if (error instanceof FileNotFoundError) {
					console.error(
						`[DevFlow:ERROR] Resource failed: devflow://memory/{name} - FileNotFoundError: Memory "${name}" not found`,
					);
					return {
						text: `# Error: Memory Not Found\n\nMemory file "${name}" could not be found in the memory bank.`,
						mimeType: 'text/markdown',
						uri: `devflow://memory/${name}`,
					};
				}

				if (error instanceof ValidationError) {
					console.error(
						`[DevFlow:ERROR] Resource failed: devflow://memory/{name} - ValidationError: ${error.message}`,
					);
					return {
						text: `# Error: Invalid Memory Name\n\n${error.message}`,
						mimeType: 'text/markdown',
						uri: `devflow://memory/${name}`,
					};
				}

				const errorMessage =
					error instanceof Error ? error.message : 'Unknown error';
				console.error(
					`[DevFlow:ERROR] Resource failed: devflow://memory/{name} - Error: ${errorMessage}`,
				);
				return {
					text: `# Error: Failed to Load Memory\n\n${errorMessage}`,
					mimeType: 'text/markdown',
					uri: `devflow://memory/${name}`,
				};
			}
		},
	};
}
