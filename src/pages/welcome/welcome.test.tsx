import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/preact';
import '@testing-library/jest-dom';
import { WelcomePage } from './welcome';

describe('WelcomePage', () => {
	it('renders welcome message and buttons', () => {
		const { getByText } = render(<WelcomePage os="mac" />);

		expect(getByText('Welcome to Zinc IDE')).toBeInTheDocument();
		expect(
			getByText(
				'Start coding with a powerful, functional IDE built for developers.',
			),
		).toBeInTheDocument();
		expect(getByText('Open Project')).toBeInTheDocument();
		expect(
			getByText('Tip: Press Cmd+O to open a project.'),
		).toBeInTheDocument();
	});

	it('buttons are clickable', () => {
		const { getByText } = render(<WelcomePage os="mac" />);

		const openButton = getByText('Open Project');

		expect(openButton).toBeEnabled();
	});

	it('displays correct shortcut for Windows', () => {
		const { getByText } = render(<WelcomePage os="windows" />);

		expect(
			getByText('Tip: Press Ctrl+O to open a project.'),
		).toBeInTheDocument();
	});
});
