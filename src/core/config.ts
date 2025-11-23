import path from 'node:path';
import { realpath } from 'node:fs/promises';

export async function detectProjectRoot(): Promise<string> {
	const devflowRoot = process.env.DEVFLOW_ROOT;
	if (devflowRoot) {
		console.error(
			`[DevFlow:DEBUG] Using DEVFLOW_ROOT override: ${devflowRoot}`,
		);
		return path.resolve(devflowRoot);
	}

	const indicators = ['.git', 'package.json', 'pyproject.toml'];
	// eslint-disable-next-line security/detect-non-literal-fs-filename
	const originalCurrentDirectory = await realpath(process.cwd());
	let currentDirectory = originalCurrentDirectory;

	while (true) {
		for (const indicator of indicators) {
			try {
				const { readdir } = await import('node:fs/promises');
				const entries = await readdir(currentDirectory);
				if (entries.includes(indicator)) {
					console.error(
						`[DevFlow:DEBUG] Found project indicator (${indicator}) at: ${currentDirectory}`,
					);
					return currentDirectory;
				}
			} catch {
				// Continue checking other indicators
			}
		}

		const parentDirectory = path.dirname(currentDirectory);
		if (parentDirectory === currentDirectory) {
			// Reached filesystem root, use original cwd as fallback
			console.error(
				`[DevFlow:DEBUG] No project indicator found, falling back to cwd: ${originalCurrentDirectory}`,
			);
			return originalCurrentDirectory;
		}

		currentDirectory = parentDirectory;
	}
}
