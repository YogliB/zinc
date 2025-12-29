import type { Meta, StoryObj } from '@storybook/preact-vite';
import { CommandPalette } from './command-palette';

const meta: Meta<typeof CommandPalette> = {
	title: 'Organisms/CommandPalette',
	component: CommandPalette,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleCommands = [
	{ id: '1', title: 'Open File', action: () => console.log('Open File') },
	{ id: '2', title: 'Save File', action: () => console.log('Save File') },
	{
		id: '3',
		title: 'Close Editor',
		action: () => console.log('Close Editor'),
	},
];

export const Default: Story = {
	args: {
		isOpen: true,
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		onClose: () => {},
		commands: sampleCommands,
	},
};
