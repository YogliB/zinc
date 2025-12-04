import { describe, it, expect } from 'vitest';
import { PluginRegistry } from '../../../../../src/core/analysis/plugins/registry';
import { MockLanguagePlugin } from '../../../../setup/mocks';

describe('PluginRegistry', () => {
	it('should register a plugin', () => {
		const registry = new PluginRegistry();
		const plugin = new MockLanguagePlugin('test', ['typescript']);

		registry.register(plugin);

		expect(registry.has('typescript')).toBe(true);
		expect(registry.get('typescript')).toBe(plugin);
	});

	it('should register plugin for multiple languages', () => {
		const registry = new PluginRegistry();
		const plugin = new MockLanguagePlugin('test', [
			'typescript',
			'javascript',
		]);

		registry.register(plugin);

		expect(registry.has('typescript')).toBe(true);
		expect(registry.has('javascript')).toBe(true);
		expect(registry.get('typescript')).toBe(plugin);
		expect(registry.get('javascript')).toBe(plugin);
	});

	it('should return undefined for unregistered language', () => {
		const registry = new PluginRegistry();

		expect(registry.get('python')).toBeUndefined();
		expect(registry.has('python')).toBe(false);
	});

	it('should return all registered plugins', () => {
		const registry = new PluginRegistry();
		const plugin1 = new MockLanguagePlugin('plugin1', ['typescript']);
		const plugin2 = new MockLanguagePlugin('plugin2', ['javascript']);

		registry.register(plugin1);
		registry.register(plugin2);

		const all = registry.getAll();
		expect(all).toHaveLength(2);
		expect(all).toContain(plugin1);
		expect(all).toContain(plugin2);
	});

	it('should deduplicate plugins in getAll', () => {
		const registry = new PluginRegistry();
		const plugin = new MockLanguagePlugin('test', [
			'typescript',
			'javascript',
		]);

		registry.register(plugin);

		const all = registry.getAll();
		expect(all).toHaveLength(1);
		expect(all[0]).toBe(plugin);
	});

	it('should overwrite plugin for same language', () => {
		const registry = new PluginRegistry();
		const plugin1 = new MockLanguagePlugin('plugin1', ['typescript']);
		const plugin2 = new MockLanguagePlugin('plugin2', ['typescript']);

		registry.register(plugin1);
		registry.register(plugin2);

		expect(registry.get('typescript')).toBe(plugin2);
	});
});
