import type { Meta, StoryObj } from '@storybook/preact-vite';
import { EditorTab } from './editor-tab';

const meta: Meta<typeof EditorTab> = {
	title: 'Atoms/EditorTab',
	component: EditorTab,
	parameters: {
		layout: 'centered',
	},
	argTypes: {
		name: { control: 'text' },
		isActive: { control: 'boolean' },
		onSelect: { action: 'selected' },
		onClose: { action: 'closed' },
	},
};

export default meta;
type Story = StoryObj<typeof EditorTab>;

export const Default: Story = {
	args: {
		name: 'file.txt',
		isActive: false,
		onSelect: () => console.log('Tab selected'),
		onClose: () => console.log('Tab closed'),
	},
};

export const Active: Story = {
	args: {
		name: 'active-file.js',
		isActive: true,
		onSelect: () => console.log('Tab selected'),
		onClose: () => console.log('Tab closed'),
	},
};

export const LongName: Story = {
	args: {
		name: 'very-long-file-name-that-should-truncate.tsx',
		isActive: false,
		onSelect: () => console.log('Tab selected'),
		onClose: () => console.log('Tab closed'),
	},
};
