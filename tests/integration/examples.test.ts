import { describe, it, expect } from 'vitest';

function throwError() {
	throw new Error('test error');
}

describe('Integration Test Examples', () => {
	it('should handle async operations', async () => {
		const result = await Promise.resolve('integration test');
		expect(result).toBe('integration test');
	});

	it('should work with objects', async () => {
		const object = { name: 'test', value: 42 };
		expect(object.name).toBe('test');
		expect(object.value).toBe(42);
	});

	it('should handle arrays', async () => {
		const array = [1, 2, 3, 4, 5];
		expect(array).toHaveLength(5);
		expect(array[0]).toBe(1);
	});

	it('should handle multiple assertions', async () => {
		const data = { id: 1, status: 'active' };
		expect(data).toBeDefined();
		expect(data.id).toBe(1);
		expect(data.status).toBe('active');
	});

	it('should handle errors', async () => {
		expect(throwError).toThrow('test error');
	});
});

describe('Integration - Data Persistence', () => {
	it('should simulate data save and retrieve', async () => {
		const store = new Map([
			['key1', 'value1'],
			['key2', 'value2'],
		]);

		expect(store.get('key1')).toBe('value1');
		expect(store.size).toBe(2);
	});

	it('should handle data transformations', async () => {
		const original = [1, 2, 3];
		const transformed = original.map((x) => x * 2);

		expect(transformed).toEqual([2, 4, 6]);
		expect(original).toEqual([1, 2, 3]);
	});
});
