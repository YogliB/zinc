#!/usr/bin/env bun
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const templateFiles = [
	'src/layers/memory/templates/TEMPLATES.md',
	'src/layers/memory/templates/activeContext.md',
	'src/layers/memory/templates/progress.md',
	'src/layers/memory/templates/projectContext.md',
	'src/layers/memory/templates/decisionLog.md',
];

console.log('[Build] Copying template files to dist...');

for (const templatePath of templateFiles) {
	const sourcePath = path.join(projectRoot, templatePath);
	const destinationPath = path.join(
		projectRoot,
		templatePath.replace('src/', 'dist/'),
	);
	const destinationDirectory = path.dirname(destinationPath);

	// eslint-disable-next-line security/detect-non-literal-fs-filename
	if (!existsSync(destinationDirectory)) {
		// eslint-disable-next-line security/detect-non-literal-fs-filename
		mkdirSync(destinationDirectory, { recursive: true });
	}

	copyFileSync(sourcePath, destinationPath);
	console.log(`  ✓ Copied ${templatePath} → ${destinationPath}`);
}

console.log('[Build] Template files copied successfully');
