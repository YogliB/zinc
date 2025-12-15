import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/preact';
import '@testing-library/jest-dom';
import { WelcomePage } from './welcome';

describe('WelcomePage', () => {
	it('renders welcome message and buttons', () => {
		const { getByText } = render(<WelcomePage />);

		expect(getByText('Welcome to Zinc IDE')).toBeInTheDocument();
		expect(
			getByText(
				'Start coding with a powerful, functional IDE built for developers.',
			),
		).toBeInTheDocument();
		expect(getByText('Open Project')).toBeInTheDocument();
		expect(getByText('New Project')).toBeInTheDocument();
		expect(getByText('Settings')).toBeInTheDocument();
	});

	it('buttons are clickable', () => {
		const { getByText } = render(<WelcomePage />);

		const openButton = getByText('Open Project');
		const newButton = getByText('New Project');
		const settingsButton = getByText('Settings');

		expect(openButton).toBeEnabled();
		expect(newButton).toBeEnabled();
		expect(settingsButton).toBeEnabled();
	});
});
