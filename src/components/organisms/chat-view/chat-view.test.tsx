import { render, screen, fireEvent } from '@testing-library/preact';
import { describe, it, expect, vi } from 'vitest';
import { ChatView } from './chat-view';

const sampleMessages = [
	{ id: '1', role: 'user' as const, content: 'Hello' },
	{ id: '2', role: 'assistant' as const, content: 'Hi there' },
];

describe('ChatView', () => {
	it('renders messages correctly', () => {
		const mockOnSend = vi.fn();
		render(
			<ChatView messages={sampleMessages} onSendMessage={mockOnSend} />,
		);

		expect(screen.getByText('Hello')).toBeInTheDocument();
		expect(screen.getByText('Hi there')).toBeInTheDocument();
	});

	it('calls onSendMessage when send button is clicked', () => {
		const mockOnSend = vi.fn();
		render(
			<ChatView messages={sampleMessages} onSendMessage={mockOnSend} />,
		);

		const input = screen.getByPlaceholderText('Type a message...');
		const sendButton = screen.getByText('Send');

		fireEvent.change(input, { target: { value: 'New message' } });
		fireEvent.click(sendButton);

		expect(mockOnSend).toHaveBeenCalledWith('New message');
	});

	it('calls onSendMessage when Enter is pressed', () => {
		const mockOnSend = vi.fn();
		render(
			<ChatView messages={sampleMessages} onSendMessage={mockOnSend} />,
		);

		const input = screen.getByPlaceholderText('Type a message...');

		fireEvent.change(input, { target: { value: 'New message' } });
		fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

		expect(mockOnSend).toHaveBeenCalledWith('New message');
	});
});
