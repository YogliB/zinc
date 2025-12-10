<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import FormField from './FormField.svelte';

  const { Story } = defineMeta({
    component: FormField,
    title: 'Molecules/FormField',
  });
</script>

<Story name="Input Field" args={{ label: 'Username', placeholder: 'Enter username' }}>
  <FormField label="Username" placeholder="Enter username" />
</Story>

<Story name="Password Field" args={{ label: 'Password', type: 'input', inputType: 'password', placeholder: 'Enter password' }}>
  <FormField label="Password" type="input" inputType="password" placeholder="Enter password" />
</Story>

<Story name="Select Field" args={{ label: 'Country', type: 'select', options: [{ value: 'us', label: 'United States' }, { value: 'ca', label: 'Canada' }] }}>
  <FormField label="Country" type="select" options={[{ value: 'us', label: 'United States' }, { value: 'ca', label: 'Canada' }]} />
</Story>
