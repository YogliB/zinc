import { cpSync, readdirSync, rmSync } from 'node:fs';
import * as esbuild from 'esbuild';

function cleanupDistributionDirectory(): void {
	try {
		rmSync('./dist', { recursive: true, force: true });
	} catch (error) {
		console.warn('Failed to cleanup dist directory:', error);
	}
}

function cleanupBuildArtifacts(): void {
	try {
		const files = readdirSync('.');
		for (const file of files) {
			if (file.startsWith('.') && file.endsWith('.bun-build')) {
				rmSync(file, { force: true });
			}
		}
	} catch (error) {
		console.warn('Failed to cleanup build artifacts:', error);
	}
}

console.log('Building devflow...');

try {
	cleanupDistributionDirectory();

	await esbuild.build({
		entryPoints: ['./src/server.ts'],
		outdir: './dist',
		target: 'node20',
		platform: 'node',
		format: 'esm',
		minify: true,
		bundle: true,
		external: [
			'effect',
			'@valibot/to-json-schema',
			'sury',
			'better-sqlite3',
			'node:path',
			'node:fs',
			'node:crypto',
			'node:os',
			'node:fs/promises',
			'node:url',
			'node:process',
			'node:buffer',
			'node:events',
			'timers/promises',
			'child_process',
		],
	});

	cleanupBuildArtifacts();

	// Copy migration files
	cpSync('./src/analytics/migrations', './dist/analytics/migrations', {
		recursive: true,
	});

	console.log('✅ Build completed successfully');
} catch (error) {
	console.error('Build error:', error);
	throw error;
}
