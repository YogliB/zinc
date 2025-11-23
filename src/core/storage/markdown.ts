import matter from 'gray-matter';

export interface MarkdownFile {
	frontmatter: Record<string, unknown>;
	content: string;
}

export function parseMarkdown(text: string): MarkdownFile {
	const { data, content } = matter(text);
	return {
		frontmatter: data,
		content: content.trim(),
	};
}

export function stringifyMarkdown(file: MarkdownFile): string {
	if (Object.keys(file.frontmatter).length === 0) {
		return file.content;
	}

	const frontmatterLines = ['---'];

	for (const [key, value] of Object.entries(file.frontmatter)) {
		if (value === null || value === undefined) {
			frontmatterLines.push(`${key}:`);
		} else if (value instanceof Date) {
			frontmatterLines.push(`${key}: "${value.toISOString()}"`);
		} else if (typeof value === 'string' && value.includes('\n')) {
			const multilineValue = value
				.split('\n')
				.map((line) => `  ${line}`)
				.join('\n');
			frontmatterLines.push(`${key}: |`, multilineValue);
		} else if (Array.isArray(value)) {
			frontmatterLines.push(`${key}: ${JSON.stringify(value)}`);
		} else if (typeof value === 'object') {
			frontmatterLines.push(`${key}: ${JSON.stringify(value)}`);
		} else if (typeof value === 'string' && value.includes('"')) {
			frontmatterLines.push(`${key}: ${JSON.stringify(value)}`);
		} else {
			frontmatterLines.push(`${key}: ${value}`);
		}
	}

	frontmatterLines.push('---', '', file.content);

	return frontmatterLines.join('\n');
}
