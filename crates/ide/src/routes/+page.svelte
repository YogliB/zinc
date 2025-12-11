<script lang="ts">
	import { onMount } from 'svelte';
	import { invoke } from '@tauri-apps/api/core';
	import { listen } from '@tauri-apps/api/event';
	import { IdeWorkspace } from '../lib/components/organisms';
	import { WelcomeScreen } from '$lib/components/molecules';

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
	let openingFolder = $state(false);
	let openingFile = $state(false);

	async function openFolder() {
		try {
			const path = (await invoke('open_folder')) as string;
			const nodes = (await invoke('read_directory', {
				path,
			})) as FileNode[];
			folderNodes = nodes;
			currentFolderPath = path;
		} catch (e) {
			console.error('Error opening folder:', e);
		}
	}

	function handleFileSelect(path: string) {
		alert('File selected: ' + path);
		// no-op for now
	}

	async function openFile() {
		try {
			code = await invoke('open_file');
		} catch (e) {
			console.error('Error opening file:', e);
		}
	}

	async function saveFile() {
		try {
			await invoke('save_file', { content: code });
		} catch (e) {
			console.error('Error saving file:', e);
		}
	}

	async function loadSettings() {
		try {
			settings = await invoke('load_settings');
		} catch (e) {
			console.error('Error loading settings:', e);
		}
	}

	async function saveSettings() {
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

	onMount(async () => {
		loadSettings();
		await listen('open-folder', async () => {
			if (!openingFolder) {
				openingFolder = true;
				try {
					await openFolder();
				} finally {
					openingFolder = false;
				}
			}
		});
		await listen('open-file', async () => {
			if (!openingFile) {
				openingFile = true;
				try {
					await openFile();
				} finally {
					openingFile = false;
				}
			}
		});
	});

	let code = $state(`// Welcome to Zinc IDE
console.log('Hello, world!');

function greet(name: string) {
  return 'Hello, ' + name + '!';
}

console.log(greet('Developer'));`);
</script>

{#if currentFolderPath}
<IdeWorkspace {folderNodes} {messages} bind:userInput bind:settings bind:code onSelect={handleFileSelect} onOpenFolder={openFolder} {openFile} {saveFile} {sendMessage} {loadSettings} {saveSettings} />
{:else}
<WelcomeScreen onOpenFolder={openFolder} onOpenFile={openFile} version="v0.1.0" />
{/if}

<style>
</style>
