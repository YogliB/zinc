import { MemoryRepository } from '../../layers/memory/repository';
import { FileNotFoundError } from '../../core/storage/errors';
import type { Prompt } from 'fastmcp';

type SessionAuth = Record<string, unknown> | undefined;

export function createMemoryUpdatePrompt(
	repository: MemoryRepository,
): Prompt<SessionAuth> {
	return {
		name: 'memory:update',
		description:
			'Review all memory bank files and guide through update workflow',
		arguments: [],
		load: async (): Promise<string> => {
			console.error(
				'[DevFlow:INFO] Prompt called: memory:update (review workflow)',
			);

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
						`[DevFlow:INFO] Prompt operation: loaded ${fileName}`,
					);
				} catch (error) {
					if (error instanceof FileNotFoundError) {
						console.error(
							`[DevFlow:WARN] Prompt operation partial: ${fileName}.md missing`,
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
							`[DevFlow:WARN] Prompt operation partial: failed to load ${fileName} - ${errorMessage}`,
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
				`[DevFlow:INFO] Prompt operation succeeded: memory:update loaded ${filesLoaded} files`,
			);

			sections.push(
				'---',
				'',
				`**Status:** ${summary}`,
				'',
				'Begin by reviewing the memory files above, then use the memory-save tool to update them.',
			);

			return sections.join('\n');
		},
	};
}

function getFileDisplayName(fileName: string): string {
	const names = new Map<string, string>([
		['projectContext', 'Project Context'],
		['activeContext', 'Active Context'],
		['progress', 'Progress'],
		['decisionLog', 'Decision Log'],
	]);

	return names.get(fileName) ?? fileName;
}
