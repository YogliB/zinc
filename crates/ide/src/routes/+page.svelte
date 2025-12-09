<script lang="ts">
	import { onMount } from 'svelte';
	import { invoke } from '@tauri-apps/api/core';
	import SvelteCodeMirror from 'svelte-codemirror-editor';
	import { basicSetup } from '@codemirror/basic-setup';
	import { javascript } from '@codemirror/lang-javascript';
	import { oneDark } from '@codemirror/theme-one-dark';

	interface Message {
		role: 'user' | 'assistant';
		content: string;
	}

	let settings = $state({
		apiKey: '',
		model: 'anthropic/claude-3-haiku',
		aiEnabled: true,
	});

	let messages = $state<Message[]>([]);
	let userInput = $state('');

	async function openFile() {
		try {
			code = await invoke('open_file');
		} catch (e) {
			alert('Error opening file: ' + e);
		}
	}

	async function saveFile() {
		try {
			await invoke('save_file', { content: code });
		} catch (e) {
			alert('Error saving file: ' + e);
		}
	}

	async function loadSettings() {
		try {
			settings = await invoke('load_settings');
		} catch (e) {
			alert('Error loading settings: ' + e);
		}
	}

	async function saveSettings() {
		try {
			await invoke('save_settings', { settings });
		} catch (e) {
			alert('Error saving settings: ' + e);
		}
	}

	async function sendMessage() {
		if (!settings.aiEnabled) {
			alert('AI is disabled');
			return;
		}
		try {
			const response = (await invoke('agent_message', {
				message: userInput,
			})) as string;
			messages.push({ role: 'user', content: userInput });
			messages.push({ role: 'assistant', content: response });
			userInput = '';
		} catch (e) {
			alert('Error sending message: ' + e);
		}
	}

	onMount(() => {
		loadSettings();
	});

	let code = $state(`// Welcome to Zinc IDE
console.log('Hello, world!');

function greet(name: string) {
  return \`Hello, \${name}!\`;
}

console.log(greet('Developer'));`);

	let extensions = [basicSetup, javascript(), oneDark];
</script>

<div class="h-screen w-screen flex bg-gray-50">
	<div class="flex-1 flex flex-col overflow-hidden resize-x min-w-0">
		<div class="bg-white border-b p-2 flex gap-2">
			<button
				class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
				onclick={openFile}>Open File</button
			>
			<button
				class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
				onclick={saveFile}>Save File</button
			>
		</div>
		<div class="flex-1">
			<SvelteCodeMirror bind:value={code} {extensions} class="h-full" />
		</div>
	</div>
	<div class="w-1/3 bg-white border-l flex flex-col">
		<div class="p-4 border-b">
			<h2 class="text-lg font-bold">AI Chat</h2>
		</div>
		<div class="flex-1 flex flex-col">
			<div class="flex-1 overflow-y-auto p-4 space-y-2">
				{#each messages as msg}
					<div
						class="p-2 rounded {msg.role === 'user'
							? 'bg-blue-100'
							: 'bg-gray-100'}"
					>
						<strong>{msg.role}:</strong>
						{msg.content}
					</div>
				{/each}
			</div>
			<div class="p-4 border-t">
				<input
					bind:value={userInput}
					class="w-full p-2 border rounded"
					placeholder="Type a message..."
					onkeydown={(e) => {
						if (e.key === 'Enter') sendMessage();
					}}
				/>
				<button
					onclick={sendMessage}
					class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
					disabled={!settings.aiEnabled}
				>
					Send
				</button>
			</div>
		</div>
		<div class="p-4 border-t">
			<h3 class="text-md font-semibold mb-2">Settings</h3>
			<form class="space-y-2">
				<div>
					<label for="apiKey" class="block text-sm"
						>OpenRouter API Key</label
					>
					<input
						id="apiKey"
						type="text"
						bind:value={settings.apiKey}
						class="w-full p-2 border rounded"
						placeholder="Enter API key"
					/>
				</div>
				<div>
					<label for="model" class="block text-sm">Model</label>
					<select
						id="model"
						bind:value={settings.model}
						class="w-full p-2 border rounded"
					>
						<option value="anthropic/claude-3-haiku"
							>anthropic/claude-3-haiku</option
						>
						<option value="openai/gpt-4o-mini"
							>openai/gpt-4o-mini</option
						>
						<option value="meta-llama/llama-3.1-8b-instruct"
							>meta-llama/llama-3.1-8b-instruct</option
						>
					</select>
				</div>
				<div>
					<label class="flex items-center">
						<input
							type="checkbox"
							bind:checked={settings.aiEnabled}
							class="mr-2"
						/>
						Enable AI
					</label>
				</div>
				<div class="flex gap-2">
					<button
						type="button"
						class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
						onclick={loadSettings}>Load Settings</button
					>
					<button
						type="button"
						class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
						onclick={saveSettings}>Save Settings</button
					>
				</div>
			</form>
		</div>
	</div>
</div>

<style>
</style>
