<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import SettingsPanel from './SettingsPanel.svelte';

  const { Story } = defineMeta({
    component: SettingsPanel,
    title: 'Organisms/SettingsPanel',
  });
</script>

<Story name="Default Settings" args={{ settings: { apiKey: '', model: 'anthropic/claude-3-haiku', aiEnabled: true }, loadSettings: () => {}, saveSettings: () => {} }}>
  <SettingsPanel settings={{ apiKey: '', model: 'anthropic/claude-3-haiku', aiEnabled: true }} loadSettings={() => {}} saveSettings={() => {}} />
</Story>

<Story name="With API Key" args={{ settings: { apiKey: 'sk-or-v1-...', model: 'openai/gpt-4o-mini', aiEnabled: true }, loadSettings: () => {}, saveSettings: () => {} }}>
  <SettingsPanel settings={{ apiKey: 'sk-or-v1-...', model: 'openai/gpt-4o-mini', aiEnabled: true }} loadSettings={() => {}} saveSettings={() => {}} />
</Story>

<Story name="AI Disabled" args={{ settings: { apiKey: '', model: '', aiEnabled: false }, loadSettings: () => {}, saveSettings: () => {} }}>
  <SettingsPanel settings={{ apiKey: '', model: '', aiEnabled: false }} loadSettings={() => {}} saveSettings={() => {}} />
</Story>
