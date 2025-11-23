#!/usr/bin/env bun
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('[Build] Copying template files to dist...');

const destinationTemplatesDirectory = path.join(
	projectRoot,
	'dist/layers/memory/templates',
);

if (!existsSync(destinationTemplatesDirectory)) {
	mkdirSync(destinationTemplatesDirectory, { recursive: true });
}

copyFileSync(
	path.join(projectRoot, 'src/layers/memory/templates/TEMPLATES.md'),
	path.join(projectRoot, 'dist/layers/memory/templates/TEMPLATES.md'),
);
console.log('  ✓ Copied TEMPLATES.md');

copyFileSync(
	path.join(projectRoot, 'src/layers/memory/templates/activeContext.md'),
	path.join(projectRoot, 'dist/layers/memory/templates/activeContext.md'),
);
console.log('  ✓ Copied activeContext.md');

copyFileSync(
	path.join(projectRoot, 'src/layers/memory/templates/progress.md'),
	path.join(projectRoot, 'dist/layers/memory/templates/progress.md'),
);
console.log('  ✓ Copied progress.md');

copyFileSync(
	path.join(projectRoot, 'src/layers/memory/templates/projectContext.md'),
	path.join(projectRoot, 'dist/layers/memory/templates/projectContext.md'),
);
console.log('  ✓ Copied projectContext.md');

copyFileSync(
	path.join(projectRoot, 'src/layers/memory/templates/decisionLog.md'),
	path.join(projectRoot, 'dist/layers/memory/templates/decisionLog.md'),
);
console.log('  ✓ Copied decisionLog.md');

console.log('[Build] Template files copied successfully');
