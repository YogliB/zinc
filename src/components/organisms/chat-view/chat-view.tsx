import { signal } from '@preact/signals';
import { useRef, useEffect } from 'preact/hooks';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';

interface Message {
	id: string;
	role: 'user' | 'assistant';
	content: string;
}

interface ChatViewProperties {
	messages: Message[];
	onSendMessage: (content: string) => void;
}

const inputValue = signal('');

export function ChatView({ messages, onSendMessage }: ChatViewProperties) {
	const messagesEndReference = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndReference.current?.scrollIntoView?.({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const handleSend = () => {
		if (inputValue.value.trim()) {
			onSendMessage(inputValue.value.trim());
			inputValue.value = '';
		}
	};

	const handleKeyPress = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			handleSend();
		}
	};

	return (
		<div className="flex h-full flex-col">
			<div className="flex-1 space-y-4 overflow-y-auto p-4">
				{messages.map((message) => (
					<div
						key={message.id}
						className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
					>
						<div
							className={`max-w-xs rounded-lg px-4 py-2 lg:max-w-md ${
								message.role === 'user'
									? 'bg-blue-500 text-white'
									: 'bg-gray-200 text-gray-800'
							}`}
						>
							{message.content}
						</div>
					</div>
				))}
				<div ref={messagesEndReference} />
			</div>
			<div className="border-t p-4">
				<div className="flex space-x-2">
					<Input
						value={inputValue.value}
						onChange={(event) =>
							(inputValue.value = (
								event.target as HTMLInputElement
							).value)
						}
						onKeyPress={handleKeyPress}
						placeholder="Type a message..."
						className="flex-1"
					/>
					<Button onClick={handleSend}>Send</Button>
				</div>
			</div>
		</div>
	);
}
