<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import MessageBubble from './MessageBubble.svelte';

  const { Story } = defineMeta({
    component: MessageBubble,
    title: 'Molecules/MessageBubble',
  });
</script>

<Story name="User Message" args={{ role: 'user', content: 'Hello, how can I help you?' }}>
  <MessageBubble role="user" content="Hello, how can I help you?" />
</Story>

<Story name="Assistant Message" args={{ role: 'assistant', content: 'I need help with coding.' }}>
  <MessageBubble role="assistant" content="I need help with coding." />
</Story>
