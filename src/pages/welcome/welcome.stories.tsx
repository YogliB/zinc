import type { Meta, StoryObj } from '@storybook/preact';

import { WelcomePage } from './welcome';

const meta: Meta<typeof WelcomePage> = {
  component: WelcomePage,
  title: 'Pages/Welcome',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof WelcomePage>;

export const Default: Story = {};
