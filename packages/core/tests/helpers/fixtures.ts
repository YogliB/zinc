export const sampleTypeScriptFile = `export class TestClass {
	private name: string;

	constructor(name: string) {
		this.name = name;
	}

	getName(): string {
		return this.name;
	}
}

export interface TestInterface {
	id: number;
	value: string;
}

export function testFunction(param: string): string {
	return \`Hello, \${param}\`;
}

export const testVariable = 'test';
`;
