import type { Meta, StoryObj } from '@storybook/preact-vite';
import { EditorTabs } from './editor-tabs';
import { OpenFile } from '@/lib/types';

const meta: Meta<typeof EditorTabs> = {
	title: 'Molecules/EditorTabs',
	component: EditorTabs,
	parameters: {
		layout: 'centered',
	},
	argTypes: {
		openFiles: { control: 'object' },
		activeFilePath: { control: 'text' },
		onTabSelect: { action: 'tab selected' },
		onTabClose: { action: 'tab closed' },
	},
};

export default meta;
type Story = StoryObj<typeof EditorTabs>;

const sampleFiles: OpenFile[] = [
	{
		path: '/project/src/index.ts',
		name: 'index.ts',
		content: 'console.log("hello");',
	},
	{ path: '/project/src/app.tsx', name: 'app.tsx', content: '<App />' },
	{
		path: '/project/src/utils.ts',
		name: 'utils.ts',
		content: 'export const add = (a, b) => a + b;',
	},
];

export const SingleTab: Story = {
	args: {
		openFiles: [sampleFiles[0]],
		activeFilePath: sampleFiles[0].path,
		onTabSelect: (path: string) => console.log('Selected:', path),
		onTabClose: (path: string) => console.log('Closed:', path),
	},
};

export const MultipleTabs: Story = {
	args: {
		openFiles: sampleFiles,
		activeFilePath: sampleFiles[1].path,
		onTabSelect: (path: string) => console.log('Selected:', path),
		onTabClose: (path: string) => console.log('Closed:', path),
	},
};

export const ManyTabs: Story = {
	args: {
		openFiles: [
			...sampleFiles,
			{
				path: '/project/src/styles.css',
				name: 'styles.css',
				content: 'body { margin: 0; }',
			},
			{
				path: '/project/src/config.json',
				name: 'config.json',
				content: '{}',
			},
			{
				path: '/project/src/README.md',
				name: 'README.md',
				content: '# Project',
			},
		],
		activeFilePath: sampleFiles[0].path,
		onTabSelect: (path: string) => console.log('Selected:', path),
		onTabClose: (path: string) => console.log('Closed:', path),
	},
};
