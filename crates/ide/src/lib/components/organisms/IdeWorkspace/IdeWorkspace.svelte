<script lang="ts">
	import { IdeLayout } from '../../templates';
	import { CodeEditor, ChatPanel, SettingsPanel, FileTree } from '../index';

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
		<FileTree nodes={folderNodes} {onSelect} />
	{/snippet}
	{#snippet main()}
		<CodeEditor bind:code {openFile} {saveFile} />
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
