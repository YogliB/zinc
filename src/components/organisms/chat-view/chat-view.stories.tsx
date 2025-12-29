import type { Meta, StoryObj } from '@storybook/preact-vite';
import { ChatView } from './chat-view';

const meta: Meta<typeof ChatView> = {
	title: 'Organisms/ChatView',
	component: ChatView,
	parameters: {
		layout: 'fullscreen',
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleMessages = [
	{ id: '1', role: 'user' as const, content: 'Hello, how can I help you?' },
	{
		id: '2',
		role: 'assistant' as const,
		content: 'I need help with coding.',
	},
	{ id: '3', role: 'user' as const, content: 'What language are you using?' },
];

export const Default: Story = {
	args: {
		messages: sampleMessages,
		onSendMessage: (content: string) => console.log('Sent:', content),
	},
};
