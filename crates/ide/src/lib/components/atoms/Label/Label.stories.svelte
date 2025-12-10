<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Label from './Label.svelte';

  const { Story } = defineMeta({
    component: Label,
    title: 'Atoms/Label',
  });
</script>

<Story name="Default">
  <Label>Default Label</Label>
</Story>

<Story name="With htmlFor" args={{ htmlFor: 'input-id' }}>
  <Label htmlFor="input-id">Label for Input</Label>
</Story>

<Story name="Custom Class" args={{ class: 'text-lg font-bold' }}>
  <Label class="text-lg font-bold">Bold Label</Label>
</Story>
