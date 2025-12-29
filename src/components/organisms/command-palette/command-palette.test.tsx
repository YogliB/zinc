/* eslint-disable @typescript-eslint/no-empty-function */
import { render, screen, fireEvent } from '@testing-library/preact';
import { describe, it, expect, vi } from 'vitest';
import { CommandPalette } from './command-palette';

const sampleCommands = [
	{
		id: '1',
		title: 'Open File',
		action: () => {},
		keywords: ['open', 'file'],
		category: 'File',
	},
	{
		id: '2',
		title: 'Save File',
		action: () => {},
		keywords: ['save', 'file'],
		category: 'File',
	},
	{
		id: '3',
		title: 'Close Active Tab',
		action: () => {},
		keywords: ['close', 'tab'],
		category: 'Editor',
	},
];

describe('CommandPalette', () => {
	it('renders the dialog when open', () => {
		render(
			<CommandPalette
				isOpen={true}
				onClose={() => {}}
				commands={sampleCommands}
			/>,
		);

		expect(screen.getByText('Command Palette')).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText('Search commands...'),
		).toBeInTheDocument();
		expect(screen.getByText('Open File')).toBeInTheDocument();
	});

	it('filters commands based on search query', async () => {
		render(
			<CommandPalette
				isOpen={true}
				onClose={() => {}}
				commands={sampleCommands}
			/>,
		);

		const input = screen.getByPlaceholderText('Search commands...');
		fireEvent.change(input, { target: { value: 'Open' } });

		expect(screen.getByText('Open File')).toBeInTheDocument();
		expect(screen.queryByText('Save File')).not.toBeInTheDocument();
	});

	it('supports fuzzy search with partial matches', async () => {
		render(
			<CommandPalette
				isOpen={true}
				onClose={() => {}}
				commands={sampleCommands}
			/>,
		);

		const input = screen.getByPlaceholderText('Search commands...');
		fireEvent.change(input, { target: { value: 'fil' } }); // partial match for 'file'

		expect(screen.getByText('Open File')).toBeInTheDocument();
		expect(screen.getByText('Save File')).toBeInTheDocument();
		expect(screen.queryByText('Close Active Tab')).not.toBeInTheDocument();
	});

	it('shows all commands when search is empty', () => {
		render(
			<CommandPalette
				isOpen={true}
				onClose={() => {}}
				commands={sampleCommands}
			/>,
		);

		expect(screen.getByText('Open File')).toBeInTheDocument();
		expect(screen.getByText('Save File')).toBeInTheDocument();
		expect(screen.getByText('Close Active Tab')).toBeInTheDocument();
	});

	it('navigates with arrow keys', () => {
		render(
			<CommandPalette
				isOpen={true}
				onClose={() => {}}
				commands={sampleCommands}
			/>,
		);

		const input = screen.getByPlaceholderText('Search commands...');
		input.focus();

		// Initially first command selected
		expect(screen.getByText('Open File').closest('button')).toHaveClass(
			'bg-accent',
		);

		// Arrow down
		fireEvent.keyDown(document, { key: 'ArrowDown' });
		expect(screen.getByText('Save File').closest('button')).toHaveClass(
			'bg-accent',
		);

		// Arrow down again
		fireEvent.keyDown(document, { key: 'ArrowDown' });
		expect(
			screen.getByText('Close Active Tab').closest('button'),
		).toHaveClass('bg-accent');

		// Arrow down wraps
		fireEvent.keyDown(document, { key: 'ArrowDown' });
		expect(screen.getByText('Open File').closest('button')).toHaveClass(
			'bg-accent',
		);

		// Arrow up
		fireEvent.keyDown(document, { key: 'ArrowUp' });
		expect(
			screen.getByText('Close Active Tab').closest('button'),
		).toHaveClass('bg-accent');
	});

	it('executes command with Enter', () => {
		const mockAction = vi.fn();
		const commandsWithMock = [
			{
				id: '1',
				title: 'Test Command',
				action: mockAction,
				keywords: [],
				category: 'Test',
			},
		];

		render(
			<CommandPalette
				isOpen={true}
				onClose={() => {}}
				commands={commandsWithMock}
			/>,
		);

		fireEvent.keyDown(document, { key: 'Enter' });
		expect(mockAction).toHaveBeenCalled();
	});

	it('closes with Escape', () => {
		const mockOnClose = vi.fn();
		render(
			<CommandPalette
				isOpen={true}
				onClose={mockOnClose}
				commands={sampleCommands}
			/>,
		);

		fireEvent.keyDown(document, { key: 'Escape' });
		expect(mockOnClose).toHaveBeenCalled();
	});
});
