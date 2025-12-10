<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Select from './Select.svelte';

  const { Story } = defineMeta({
    component: Select,
    title: 'Atoms/Select',
  });
</script>

<Story name="Default" args={{ options: [{ value: '1', label: 'Option 1' }, { value: '2', label: 'Option 2' }] }}>
  <Select options={[{ value: '1', label: 'Option 1' }, { value: '2', label: 'Option 2' }]} />
</Story>

<Story name="With Selected Value" args={{ value: '2', options: [{ value: '1', label: 'Option 1' }, { value: '2', label: 'Option 2' }, { value: '3', label: 'Option 3' }] }}>
  <Select value="2" options={[{ value: '1', label: 'Option 1' }, { value: '2', label: 'Option 2' }, { value: '3', label: 'Option 3' }]} />
</Story>

<Story name="Disabled" args={{ disabled: true, options: [{ value: '1', label: 'Option 1' }] }}>
  <Select disabled options={[{ value: '1', label: 'Option 1' }]} />
</Story>
