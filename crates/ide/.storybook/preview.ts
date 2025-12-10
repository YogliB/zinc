import '../src/app.css';

import type { Preview } from '@storybook/sveltekit';
import StorybookContainer from './StorybookContainer.svelte';

const preview: Preview = {
	decorators: [() => ({ Component: StorybookContainer })],
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},

		a11y: {
			// 'todo' - show a11y violations in the test UI only
			// 'error' - fail CI on a11y violations
			// 'off' - skip a11y checks entirely
			test: 'todo',
		},
	},
};

export default preview;
