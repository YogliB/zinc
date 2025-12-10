<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ButtonGroup from './ButtonGroup.svelte';
  import { Button } from '../../atoms/Button';

  const { Story } = defineMeta({
    component: ButtonGroup,
    title: 'Molecules/ButtonGroup',
  });
</script>

<Story name="Default">
  <ButtonGroup>
    <Button>Button 1</Button>
    <Button variant="secondary">Button 2</Button>
  </ButtonGroup>
</Story>

<Story name="Multiple Buttons">
  <ButtonGroup>
    <Button>Save</Button>
    <Button variant="secondary">Cancel</Button>
    <Button variant="secondary">Delete</Button>
  </ButtonGroup>
</Story>
