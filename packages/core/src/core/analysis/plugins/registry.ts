import type { LanguagePlugin } from './base';

export class PluginRegistry {
	private plugins: Map<string, LanguagePlugin> = new Map();

	register(plugin: LanguagePlugin): void {
		for (const lang of plugin.languages) {
			this.plugins.set(lang, plugin);
		}
	}

	get(language: string): LanguagePlugin | undefined {
		return this.plugins.get(language);
	}

	getAll(): LanguagePlugin[] {
		return [...new Set(this.plugins.values())];
	}

	has(language: string): boolean {
		return this.plugins.has(language);
	}
}
