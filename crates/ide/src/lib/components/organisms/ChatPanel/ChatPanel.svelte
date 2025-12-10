<script lang="ts">
	import { MessageBubble } from '$lib/components/molecules';
	import { Input, Button } from '$lib/components/atoms';

	interface Message {
		role: 'user' | 'assistant';
		content: string;
	}

	interface Props {
		messages: Message[];
		userInput: string;
		sendMessage: () => void;
		aiEnabled: boolean;
	}

	let {
		messages,
		userInput = $bindable(''),
		sendMessage,
		aiEnabled,
	}: Props = $props();
</script>

<div class="p-4 border-b">
	<h2 class="text-lg font-bold">AI Chat</h2>
</div>
<div class="flex-1 flex flex-col">
	<div class="flex-1 overflow-y-auto p-4 space-y-2">
		{#each messages as msg (msg.role + msg.content)}
			<MessageBubble role={msg.role} content={msg.content} />
		{/each}
	</div>
	<div class="p-4 border-t">
		<Input
			bind:value={userInput}
			placeholder="Type a message..."
			onkeydown={(e: KeyboardEvent) => {
				if (e.key === 'Enter') sendMessage();
			}}
		/>
		<Button onclick={sendMessage} disabled={!aiEnabled}>Send</Button>
	</div>
</div>
