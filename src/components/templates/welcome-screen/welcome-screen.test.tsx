import { render, screen, fireEvent } from '@testing-library/preact';
import { describe, it, expect, vi } from 'vitest';
import { WelcomeScreen } from './welcome-screen';

describe('WelcomeScreen', () => {
	it('renders the welcome message and button', () => {
		const mockOnOpenProject = vi.fn();
		render(<WelcomeScreen os="mac" onOpenProject={mockOnOpenProject} />);

		expect(screen.getByText('Welcome to Zinc IDE')).toBeInTheDocument();
		expect(
			screen.getByText(
				'Start coding with a powerful, functional IDE built for developers.',
			),
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /open project/i }),
		).toBeInTheDocument();
	});

	it('calls onOpenProject when button is clicked', () => {
		const mockOnOpenProject = vi.fn();
		render(<WelcomeScreen os="mac" onOpenProject={mockOnOpenProject} />);

		const button = screen.getByRole('button', { name: /open project/i });
		fireEvent.click(button);

		expect(mockOnOpenProject).toHaveBeenCalledTimes(1);
	});

	it('displays correct keyboard shortcut for mac', () => {
		const mockOnOpenProject = vi.fn();
		render(<WelcomeScreen os="mac" onOpenProject={mockOnOpenProject} />);

		expect(screen.getByText('⌘')).toBeInTheDocument();
		expect(screen.getByText('O')).toBeInTheDocument();
	});

	it('displays correct keyboard shortcut for windows/linux', () => {
		const mockOnOpenProject = vi.fn();
		render(
			<WelcomeScreen os="windows" onOpenProject={mockOnOpenProject} />,
		);

		expect(screen.getByText('Ctrl')).toBeInTheDocument();
		expect(screen.getByText('O')).toBeInTheDocument();
	});
});
