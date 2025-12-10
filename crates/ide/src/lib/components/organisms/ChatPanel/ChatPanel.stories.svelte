<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ChatPanel from './ChatPanel.svelte';

  const { Story } = defineMeta({
    component: ChatPanel,
    title: 'Organisms/ChatPanel',
  });
</script>

<Story name="Empty Chat" args={{ messages: [], userInput: '', sendMessage: () => {}, aiEnabled: true }}>
  <ChatPanel messages={[]} userInput="" sendMessage={() => {}} aiEnabled={true} />
</Story>

<Story name="With Messages" args={{ messages: [{ role: 'user', content: 'Hello' }, { role: 'assistant', content: 'Hi there!' }], userInput: 'How are you?', sendMessage: () => {}, aiEnabled: true }}>
  <ChatPanel messages={[{ role: 'user', content: 'Hello' }, { role: 'assistant', content: 'Hi there!' }]} userInput="How are you?" sendMessage={() => {}} aiEnabled={true} />
</Story>

<Story name="AI Disabled" args={{ messages: [{ role: 'user', content: 'Test' }], userInput: '', sendMessage: () => {}, aiEnabled: false }}>
  <ChatPanel messages={[{ role: 'user', content: 'Test' }]} userInput="" sendMessage={() => {}} aiEnabled={false} />
</Story>
