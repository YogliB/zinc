<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import IdeLayout from './IdeLayout.svelte';
  import { CodeEditor } from '../../organisms/CodeEditor';
  import { ChatPanel } from '../../organisms/ChatPanel';

  const { Story } = defineMeta({
    component: IdeLayout,
    title: 'Templates/IdeLayout',
  });
</script>

<Story name="Default Layout">
  <IdeLayout>
    <div class="p-4">
      <h1>Main Content</h1>
      <p>This is the main area.</p>
    </div>
    <div class="p-4 bg-white">
      <h2>Sidebar</h2>
      <p>This is the sidebar.</p>
    </div>
  </IdeLayout>
</Story>

<Story name="With Components">
  <IdeLayout>
    <CodeEditor code="console.log('Hello');" openFile={() => {}} saveFile={() => {}} />
    <ChatPanel messages={[{ role: 'user', content: 'Hello' }]} userInput="" sendMessage={() => {}} aiEnabled={true} />
  </IdeLayout>
</Story>
