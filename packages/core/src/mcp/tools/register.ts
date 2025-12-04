import type { FastMCP } from 'fastmcp';
import type { AnalysisEngine } from '../../core/analysis/engine';
import type { StorageEngine } from '../../core/storage/engine';
import type { GitAnalyzer } from '../../core/analysis/git/git-analyzer';
import { registerProjectTools } from './project';
import { registerArchitectureTools } from './architecture';
import { registerSymbolTools } from './symbols';
import { registerPatternTools } from './patterns';
import { registerGraphTools } from './graph';
import { registerGitTools } from './git';
import { registerContextTools } from './context';

export function registerAllTools(
	server: FastMCP,
	engine: AnalysisEngine,
	storage: StorageEngine,
	gitAnalyzer: GitAnalyzer,
): void {
	registerProjectTools(server, engine, storage, gitAnalyzer);
	registerArchitectureTools(server, engine, storage, gitAnalyzer);
	registerSymbolTools(server, engine, storage, gitAnalyzer);
	registerPatternTools(server, engine, storage, gitAnalyzer);
	registerGraphTools(server, engine, storage, gitAnalyzer);
	registerGitTools(server, gitAnalyzer, storage, engine);
	registerContextTools(server, engine, storage, gitAnalyzer);
}
