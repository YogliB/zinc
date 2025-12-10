<script lang="ts">
	import { onMount } from 'svelte';
	import { invoke } from '@tauri-apps/api/core';
	import { IdeLayout } from '../lib/components/templates';
	import {
		CodeEditor,
		ChatPanel,
		SettingsPanel,
		FileTree,
	} from '../lib/components/organisms';
	import { Button } from '$lib/components/atoms';

	interface Message {
		role: 'user' | 'assistant';
		content: string;
	}

	interface FileNode {
		name: string;
		type: 'file' | 'folder';
		children?: FileNode[];
		path: string;
	}

	let settings = $state({
		apiKey: '',
		model: 'anthropic/claude-3-haiku',
		aiEnabled: true,
	});

	let messages = $state<Message[]>([]);
	let userInput = $state('');
	let folderNodes = $state<FileNode[]>([]);
	let currentFolderPath = $state<string>('');

	async function openFolder() {
		alert('openFolder called');
		if (typeof window === 'undefined' || !window.__TAURI__) {
			alert('Tauri not available for openFolder');
			return;
		}
		try {
			const path = (await invoke('open_folder')) as string;
			alert('Folder opened: ' + path);
			const nodes = (await invoke('read_directory', {
				path,
			})) as FileNode[];
			folderNodes = nodes;
			currentFolderPath = path;
			alert('Directory read successfully, nodes: ' + nodes.length);
		} catch (e) {
			console.error('Error opening folder:', e);
		}
	}

	function handleFileSelect(path: string) {
		alert('File selected: ' + path);
		// no-op for now
	}

	async function openFile() {
		alert('openFile called');
		if (typeof window === 'undefined' || !window.__TAURI__) {
			alert('Tauri not available for openFile');
			return;
		}
		try {
			code = await invoke('open_file');
			alert('File opened successfully');
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
	{#snippet leftSidebar()}
		<FileTree nodes={folderNodes} onSelect={handleFileSelect} />
	{/snippet}
	{#snippet main()}
		<div class="flex flex-col overflow-hidden">
			<Button
				onclick={openFolder}
				class="mb-2 p-2 bg-blue-500 text-white rounded"
				>Open Folder</Button
			>
			<CodeEditor bind:code {openFile} {saveFile} />
		</div>
	{/snippet}
	{#snippet rightSidebar()}
		<div class="bg-white border-l flex flex-col">
			<ChatPanel
				{messages}
				bind:userInput
				{sendMessage}
				aiEnabled={settings.aiEnabled}
			/>
			<SettingsPanel bind:settings {loadSettings} {saveSettings} />
		</div>
	{/snippet}
</IdeLayout>

<style>
</style>
