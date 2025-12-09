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
		if (typeof window === 'undefined' || !window.__TAURI__) return;
		try {
			code = await invoke('open_file');
		} catch (e) {
			console.error('Error opening file:', e);
		}
	}

	async function saveFile() {
		if (typeof window === 'undefined' || !window.__TAURI__) return;
		try {
			await invoke('save_file', { content: code });
		} catch (e) {
			console.error('Error saving file:', e);
		}
	}

	async function loadSettings() {
		if (typeof window === 'undefined' || !window.__TAURI__) return;
		try {
			settings = await invoke('load_settings');
		} catch (e) {
			console.error('Error loading settings:', e);
		}
	}

	async function saveSettings() {
		if (typeof window === 'undefined' || !window.__TAURI__) return;
		try {
			await invoke('save_settings', { settings });
		} catch (e) {
			console.error('Error saving settings:', e);
		}
	}

	async function sendMessage() {
		if (!settings.aiEnabled) {
			console.error('AI is disabled');
			return;
		}
		if (typeof window === 'undefined' || !window.__TAURI__) return;
		try {
			const response = (await invoke('agent_message', {
				message: userInput,
			})) as string;
			messages.push({ role: 'user', content: userInput });
			messages.push({ role: 'assistant', content: response });
			userInput = '';
		} catch (e) {
			console.error('Error sending message:', e);
		}
	}

	onMount(() => {
		loadSettings();
	});

	let code = $state(`// Welcome to Zinc IDE
console.log('Hello, world!');

function greet(name: string) {
  return 'Hello, ' + name + '!';
}

console.log(greet('Developer'));`);
</script>

<IdeLayout>
	<div class="flex flex-col overflow-hidden">
		<CodeEditor bind:code {openFile} {saveFile} />
	</div>
	<div class="bg-white border-l flex flex-col">
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
