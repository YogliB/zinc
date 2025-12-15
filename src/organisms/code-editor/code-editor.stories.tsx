import type { Meta, StoryObj } from '@storybook/preact';

import { CodeEditor } from './code-editor';

const meta: Meta<typeof CodeEditor> = {
	title: 'Organisms/CodeEditor',
	component: CodeEditor,
	argTypes: {
		onChange: { action: 'changed' },
	},
};

export default meta;

type Story = StoryObj<typeof CodeEditor>;

export const Default: Story = {
	args: {
		value: 'console.log("Hello World");',
	},
};
