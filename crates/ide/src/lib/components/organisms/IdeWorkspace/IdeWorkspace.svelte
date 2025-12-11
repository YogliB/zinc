<script lang="ts">
	import { IdeLayout } from '../../templates';
	import {
		CodeEditor,
		ChatPanel,
		SettingsPanel,
		FileTree,
	} from '../index';
	import { Button } from '../../atoms';

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

	interface Props {
		folderNodes: FileNode[];
		messages: Message[];
		userInput: string;
		settings: { apiKey: string; model: string; aiEnabled: boolean };
		code: string;
		onSelect: (path: string) => void;
		onOpenFolder: () => void;
		openFile: () => void;
		saveFile: () => void;
		sendMessage: () => void;
		loadSettings: () => void;
		saveSettings: () => void;
	}

	let {
		folderNodes,
		messages,
		userInput = $bindable(),
		settings = $bindable(),
		code = $bindable(),
		onSelect,
		onOpenFolder,
		openFile,
		saveFile,
		sendMessage,
		loadSettings,
		saveSettings,
	}: Props = $props();
</script>

<IdeLayout>
	{#snippet leftSidebar()}
		<FileTree nodes={folderNodes} onSelect={onSelect} />
	{/snippet}
	{#snippet main()}
		<div class="flex flex-col overflow-hidden">
			<Button
				onclick={onOpenFolder}
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
