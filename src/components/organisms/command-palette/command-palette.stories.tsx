import type { Meta, StoryObj } from '@storybook/preact-vite';
import { CommandPalette } from './command-palette';

const meta: Meta<typeof CommandPalette> = {
	title: 'Organisms/CommandPalette',
	component: CommandPalette,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		isOpen: {
			control: 'boolean',
			description: 'Controls whether the command palette is open',
		},
		commands: {
			description: 'Array of available commands',
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

const fileCommands = [
	{
		id: '1',
		title: 'Open File',
		action: () => console.log('Open File'),
		keywords: ['open', 'file', 'browse'],
		category: 'File',
	},
	{
		id: '2',
		title: 'Save File',
		action: () => console.log('Save File'),
		keywords: ['save', 'file', 'write'],
		category: 'File',
	},
	{
		id: '3',
		title: 'Save All',
		action: () => console.log('Save All'),
		keywords: ['save', 'all', 'files'],
		category: 'File',
	},
];

const editorCommands = [
	{
		id: '4',
		title: 'Close Active Tab',
		action: () => console.log('Close Tab'),
		keywords: ['close', 'tab', 'editor'],
		category: 'Editor',
	},
	{
		id: '5',
		title: 'Close All Tabs',
		action: () => console.log('Close All Tabs'),
		keywords: ['close', 'all', 'tabs'],
		category: 'Editor',
	},
	{
		id: '6',
		title: 'Split Editor',
		action: () => console.log('Split Editor'),
		keywords: ['split', 'editor', 'pane'],
		category: 'Editor',
	},
];

const viewCommands = [
	{
		id: '7',
		title: 'Toggle Sidebar',
		action: () => console.log('Toggle Sidebar'),
		keywords: ['toggle', 'sidebar', 'view'],
		category: 'View',
	},
	{
		id: '8',
		title: 'Toggle Terminal',
		action: () => console.log('Toggle Terminal'),
		keywords: ['toggle', 'terminal', 'console'],
		category: 'View',
	},
];

const allCommands = [...fileCommands, ...editorCommands, ...viewCommands];

export const Default: Story = {
	args: {
		isOpen: true,
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		onClose: () => {},
		commands: allCommands,
	},
};

export const WithCategories: Story = {
	args: {
		isOpen: true,
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		onClose: () => {},
		commands: allCommands,
	},
	parameters: {
		docs: {
			description: {
				story: 'Commands are automatically grouped by their category property.',
			},
		},
	},
};

export const SingleCategory: Story = {
	args: {
		isOpen: true,
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		onClose: () => {},
		commands: fileCommands,
	},
	parameters: {
		docs: {
			description: {
				story: 'Commands from a single category.',
			},
		},
	},
};

export const NoCategory: Story = {
	args: {
		isOpen: true,
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		onClose: () => {},
		commands: [
			{
				id: '1',
				title: 'Command Without Category',
				action: () => console.log('Action'),
				keywords: ['test'],
			},
			{
				id: '2',
				title: 'Another Command',
				action: () => console.log('Action 2'),
				keywords: ['test'],
			},
		],
	},
	parameters: {
		docs: {
			description: {
				story: 'Commands without a category are placed in the "General" group.',
			},
		},
	},
};

export const WithKeywords: Story = {
	args: {
		isOpen: true,
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		onClose: () => {},
		commands: [
			{
				id: '1',
				title: 'New File',
				action: () => console.log('New File'),
				keywords: ['new', 'file', 'create', 'add'],
				category: 'File',
			},
			{
				id: '2',
				title: 'Search Files',
				action: () => console.log('Search'),
				keywords: ['search', 'find', 'lookup', 'query'],
				category: 'File',
			},
		],
	},
	parameters: {
		docs: {
			description: {
				story: 'Commands can have keywords for better search matching. Try typing "create" or "find" in the search box.',
			},
		},
	},
};

export const EmptyCommands: Story = {
	args: {
		isOpen: true,
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		onClose: () => {},
		commands: [],
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows empty state when no commands are available.',
			},
		},
	},
};

export const Closed: Story = {
	args: {
		isOpen: false,
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		onClose: () => {},
		commands: allCommands,
	},
	parameters: {
		docs: {
			description: {
				story: 'The command palette in its closed state (nothing visible).',
			},
		},
	},
};

export const ManyCommands: Story = {
	args: {
		isOpen: true,
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		onClose: () => {},
		commands: [
			...allCommands,
			{
				id: '9',
				title: 'Format Document',
				action: () => console.log('Format'),
				keywords: ['format', 'prettier'],
				category: 'Editor',
			},
			{
				id: '10',
				title: 'Go to Line',
				action: () => console.log('Go to Line'),
				keywords: ['goto', 'line', 'jump'],
				category: 'Editor',
			},
			{
				id: '11',
				title: 'Find in Files',
				action: () => console.log('Find'),
				keywords: ['find', 'search', 'grep'],
				category: 'Search',
			},
			{
				id: '12',
				title: 'Replace in Files',
				action: () => console.log('Replace'),
				keywords: ['replace', 'substitute'],
				category: 'Search',
			},
			{
				id: '13',
				title: 'Toggle Fullscreen',
				action: () => console.log('Fullscreen'),
				keywords: ['fullscreen', 'maximize'],
				category: 'View',
			},
			{
				id: '14',
				title: 'Zoom In',
				action: () => console.log('Zoom In'),
				keywords: ['zoom', 'in', 'increase'],
				category: 'View',
			},
			{
				id: '15',
				title: 'Zoom Out',
				action: () => console.log('Zoom Out'),
				keywords: ['zoom', 'out', 'decrease'],
				category: 'View',
			},
		],
	},
	parameters: {
		docs: {
			description: {
				story: 'Command palette with many commands demonstrating scrolling behavior.',
			},
		},
	},
};

export const Interactive: Story = {
	args: {
		isOpen: true,
		onClose: (open: boolean) => {
			console.log('Dialog state changed to:', open);
		},
		commands: allCommands.map((cmd) => ({
			...cmd,
			action: () => {
				console.log(`Executed: ${cmd.title}`);
				alert(`Command executed: ${cmd.title}`);
			},
		})),
	},
	parameters: {
		docs: {
			description: {
				story: 'Interactive version that logs actions to console and shows alerts when commands are executed.',
			},
		},
	},
};
