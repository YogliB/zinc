import { simpleGit, type SimpleGit } from 'simple-git';

export interface GitDecision {
	readonly commitSHA: string;
	readonly message: string;
	readonly author: string;
	readonly date: string;
	readonly files: string[];
}

export interface ChangeVelocity {
	readonly path: string;
	readonly commitCount: number;
	readonly lastModified: string;
	readonly authors: string[];
}

export class GitAnalyzer {
	private git: SimpleGit;
	private projectRoot: string;

	constructor(projectRoot: string) {
		this.projectRoot = projectRoot;
		this.git = simpleGit(projectRoot);
	}

	async getFileHash(filePath: string): Promise<string> {
		try {
			const log = await this.git.log({
				file: filePath,
				maxCount: 1,
			});
			return log.latest?.hash || '';
		} catch {
			return '';
		}
	}

	async getCurrentCommitSHA(): Promise<string> {
		try {
			return await this.git.revparse(['HEAD']);
		} catch {
			return '';
		}
	}

	async getRecentDecisions(
		since: string,
		workspace?: string,
	): Promise<GitDecision[]> {
		try {
			const arguments_ = [`--since=${since}`];
			if (workspace) {
				arguments_.push('--', workspace);
			}
			const log = await this.git.log(arguments_);

			return log.all.map((commit) => ({
				commitSHA: commit.hash,
				message: commit.message,
				author: commit.author_name,
				date: commit.date,
				files: Array.isArray(commit.diff?.changed)
					? commit.diff.changed
					: [],
			}));
		} catch {
			return [];
		}
	}

	async analyzeChangeVelocity(
		filePath: string,
		since: string,
	): Promise<ChangeVelocity> {
		try {
			const log = await this.git.log([
				`--since=${since}`,
				'--',
				filePath,
			]);

			const authors = new Set<string>();
			let lastModified = '';

			for (const commit of log.all) {
				authors.add(commit.author_name);
				if (!lastModified) {
					lastModified = commit.date;
				}
			}

			return {
				path: filePath,
				commitCount: log.total,
				lastModified,
				authors: [...authors],
			};
		} catch {
			return {
				path: filePath,
				commitCount: 0,
				lastModified: '',
				authors: [],
			};
		}
	}

	async getCommitMessages(since: string): Promise<string[]> {
		try {
			const log = await this.git.log([`--since=${since}`]);
			return log.all.map((commit) => commit.message);
		} catch {
			return [];
		}
	}
}
