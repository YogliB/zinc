<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Input from './Input.svelte';

  const { Story } = defineMeta({
    component: Input,
    title: 'Atoms/Input',
  });
</script>

<Story name="Default">
  <Input />
</Story>

<Story name="With Placeholder" args={{ placeholder: 'Enter text...' }}>
  <Input placeholder="Enter text..." />
</Story>

<Story name="Password" args={{ type: 'password', placeholder: 'Enter password' }}>
  <Input type="password" placeholder="Enter password" />
</Story>

<Story name="Disabled" args={{ disabled: true, value: 'Disabled input' }}>
  <Input disabled value="Disabled input" />
</Story>
