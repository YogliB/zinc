interface ToolDescriptionInput {
	readonly summary: string;
	readonly whenToUse: {
		readonly triggers: readonly string[];
		readonly skipIf?: string;
	};
	readonly parameters?: Record<string, string>;
	readonly returns: string;
	readonly workflow?: {
		readonly before?: readonly string[];
		readonly after?: readonly string[];
	};
	readonly example?: {
		readonly scenario: string;
		readonly params: Record<string, unknown>;
		readonly next: string;
	};
	readonly antiPatterns?: {
		readonly dont: string;
		readonly do: string;
	};
}

function addTriggers(parts: string[], triggers: readonly string[]): void {
	if (triggers.length > 0) {
		parts.push('\n\nTrigger patterns:');
		for (const trigger of triggers) {
			parts.push(`\n- ${trigger}`);
		}
	}
}

function addParameters(
	parts: string[],
	parameters?: Record<string, string>,
): void {
	if (parameters && Object.keys(parameters).length > 0) {
		parts.push('\n\nParameters:');
		for (const [name, desc] of Object.entries(parameters)) {
			parts.push(`\n- ${name}: ${desc}`);
		}
	}
}

function addWorkflow(
	parts: string[],
	workflow?: {
		readonly before?: readonly string[];
		readonly after?: readonly string[];
	},
): void {
	if (!workflow) return;

	if (workflow.before && workflow.before.length > 0) {
		parts.push('\n\nBefore calling:');
		for (const step of workflow.before) {
			parts.push(`\n- ${step}`);
		}
	}

	if (workflow.after && workflow.after.length > 0) {
		parts.push('\n\nAfter receiving results:');
		for (const step of workflow.after) {
			parts.push(`\n- ${step}`);
		}
	}
}

function addExample(
	parts: string[],
	example?: {
		readonly scenario: string;
		readonly params: Record<string, unknown>;
		readonly next: string;
	},
): void {
	if (example) {
		parts.push(
			`\n\nExample - ${example.scenario}:`,
			`\n${JSON.stringify(example.params, undefined, 2)}`,
			`\nNext: ${example.next}`,
		);
	}
}

function addAntiPatterns(
	parts: string[],
	antiPatterns?: {
		readonly dont: string;
		readonly do: string;
	},
): void {
	if (antiPatterns) {
		parts.push(
			'\n\nAnti-patterns:',
			`\n❌ Don't: ${antiPatterns.dont}`,
			`\n✅ Do: ${antiPatterns.do}`,
		);
	}
}

export function createToolDescription(input: ToolDescriptionInput): string {
	const parts: string[] = [input.summary];

	addTriggers(parts, input.whenToUse.triggers);

	if (input.whenToUse.skipIf) {
		parts.push(`\n\nSkip if: ${input.whenToUse.skipIf}`);
	}

	addParameters(parts, input.parameters);

	parts.push(`\n\nReturns: ${input.returns}`);

	addWorkflow(parts, input.workflow);
	addExample(parts, input.example);
	addAntiPatterns(parts, input.antiPatterns);

	return parts.join('');
}
