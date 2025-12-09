<script lang="ts">
	import { FormField, ButtonGroup } from '../molecules';
	import { Button } from '../atoms';

	interface Props {
		settings: {
			apiKey: string;
			model: string;
			aiEnabled: boolean;
		};
		loadSettings: () => void;
		saveSettings: () => void;
	}

	let { settings = $bindable({ apiKey: '', model: '', aiEnabled: true }), loadSettings, saveSettings }: Props = $props();

	let modelOptions = [
		{ value: 'anthropic/claude-3-haiku', label: 'anthropic/claude-3-haiku' },
		{ value: 'openai/gpt-4o-mini', label: 'openai/gpt-4o-mini' },
		{ value: 'meta-llama/llama-3.1-8b-instruct', label: 'meta-llama/llama-3.1-8b-instruct' },
	];
</script>

<div class="p-4 border-t">
	<h3 class="text-md font-semibold mb-2">Settings</h3>
	<form class="space-y-2">
		<FormField
			label="OpenRouter API Key"
			type="input"
			bind:value={settings.apiKey}
			placeholder="Enter API key"
			id="apiKey"
		/>
		<FormField
			label="Model"
			type="select"
			bind:value={settings.model}
			options={modelOptions}
			id="model"
		/>
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
		<ButtonGroup>
			<Button onclick={loadSettings}>Load Settings</Button>
			<Button variant="secondary" onclick={saveSettings}>Save Settings</Button>
		</ButtonGroup>
	</form>
</div>
