import { readdirSync, rmSync } from 'node:fs';

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

	const result = await Bun.build({
		entrypoints: ['./src/server.ts'],
		outdir: './dist',
		target: 'node',
		minify: true,
		splitting: true,
		external: ['effect', '@valibot/to-json-schema', 'sury'],
	});

	if (!result.success) {
		console.error('Build failed');
		for (const log of result.logs) {
			console.error(log);
		}
		throw new Error('Build failed');
	}

	cleanupBuildArtifacts();

	console.log('✅ Build completed successfully');
} catch (error) {
	console.error('Build error:', error);
	throw error;
}
