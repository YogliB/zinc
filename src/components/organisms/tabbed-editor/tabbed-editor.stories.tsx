import type { Meta, StoryObj } from '@storybook/preact-vite';
import { TabbedEditor } from './tabbed-editor';
import { OpenFile } from '@/lib/types';

const meta: Meta<typeof TabbedEditor> = {
	title: 'Organisms/TabbedEditor',
	component: TabbedEditor,
	parameters: {
		layout: 'fullscreen',
	},
	argTypes: {
		openFiles: { control: 'object' },
		activeFilePath: { control: 'text' },
		activeContent: { control: 'text' },
		onTabSelect: { action: 'tab selected' },
		onTabClose: { action: 'tab closed' },
		onEditorChange: { action: 'editor changed' },
	},
};

export default meta;
type Story = StoryObj<typeof TabbedEditor>;

const sampleFiles: OpenFile[] = [
	{
		path: '/project/src/index.ts',
		name: 'index.ts',
		content: 'console.log("hello world");',
	},
	{
		path: '/project/src/app.tsx',
		name: 'app.tsx',
		content: 'export function App() { return <div>Hello</div>; }',
	},
];

export const EmptyState: Story = {
	args: {
		openFiles: [],
		activeFilePath: undefined,
		activeContent: '',
		onTabSelect: (path: string) => console.log('Selected:', path),
		onTabClose: (path: string) => console.log('Closed:', path),
		onEditorChange: (value: string) => console.log('Changed:', value),
	},
};

export const SingleFile: Story = {
	args: {
		openFiles: [sampleFiles[0]],
		activeFilePath: sampleFiles[0].path,
		activeContent: sampleFiles[0].content,
		onTabSelect: (path: string) => console.log('Selected:', path),
		onTabClose: (path: string) => console.log('Closed:', path),
		onEditorChange: (value: string) => console.log('Changed:', value),
	},
};

export const MultipleFiles: Story = {
	args: {
		openFiles: sampleFiles,
		activeFilePath: sampleFiles[1].path,
		activeContent: sampleFiles[1].content,
		onTabSelect: (path: string) => console.log('Selected:', path),
		onTabClose: (path: string) => console.log('Closed:', path),
		onEditorChange: (value: string) => console.log('Changed:', value),
	},
};
