<script lang="ts">
  import { onMount } from 'svelte';
  import { basicSetup } from '@codemirror/basic-setup';
  import { EditorView } from '@codemirror/view';

  let editorElement: HTMLElement;
  let code = $state(`// Welcome to Zinc IDE
console.log('Hello, world!');

function greet(name: string) {
  return \`Hello, \${name}!\`;
}

console.log(greet('Developer'));`);

  onMount(() => {
    const view = new EditorView({
      doc: code,
      extensions: [basicSetup],
      parent: editorElement,
    });

    // Update code on changes
    view.dispatch({
      effects: EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          code = update.state.doc.toString();
        }
      }),
    });
  });
</script>

<div style="height: 100vh; width: 100vw; position: relative;">
  <div bind:this={editorElement} style="height: 100%;"></div>
</div>

<style>
  :global(html, body) {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }
</style>
