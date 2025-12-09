<script lang="ts">
	import { onMount } from 'svelte';
	import { invoke } from '@tauri-apps/api/core';
	import { IdeLayout } from '../lib/components/templates';
	import {
		CodeEditor,
		ChatPanel,
		SettingsPanel,
	} from '../lib/components/organisms';

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
</script>

<IdeLayout>
	<div class="flex-1 flex flex-col overflow-hidden resize-x min-w-0">
		<CodeEditor bind:code {openFile} {saveFile} />
	</div>
	<div class="w-1/3 bg-white border-l flex flex-col">
		<ChatPanel
			{messages}
			bind:userInput
			{sendMessage}
			aiEnabled={settings.aiEnabled}
		/>
		<SettingsPanel bind:settings {loadSettings} {saveSettings} />
	</div>
</IdeLayout>

<style>
</style>
