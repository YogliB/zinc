<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Button from './Button.svelte';

  const { Story } = defineMeta({
    component: Button,
    title: 'Atoms/Button',
  });
</script>

<Story name="Primary">
  <Button>Primary Button</Button>
</Story>

<Story name="Secondary" args={{ variant: 'secondary' }}>
  <Button variant="secondary">Secondary Button</Button>
</Story>

<Story name="Disabled" args={{ disabled: true }}>
  <Button disabled>Disabled Button</Button>
</Story>
