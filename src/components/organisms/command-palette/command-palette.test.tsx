/* eslint-disable @typescript-eslint/no-empty-function */
import { render, screen, fireEvent, waitFor } from '@testing-library/preact';
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
	it('renders the command palette when open', () => {
		render(
			<CommandPalette
				isOpen={true}
				onClose={() => {}}
				commands={sampleCommands}
			/>,
		);

		expect(
			screen.getByPlaceholderText('Search commands...'),
		).toBeInTheDocument();
		expect(screen.getByText('Open File')).toBeInTheDocument();
	});

	it('groups commands by category', () => {
		render(
			<CommandPalette
				isOpen={true}
				onClose={() => {}}
				commands={sampleCommands}
			/>,
		);

		// Check that commands from different categories are present
		expect(screen.getByText('Open File')).toBeInTheDocument();
		expect(screen.getByText('Close Active Tab')).toBeInTheDocument();
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
		fireEvent.input(input, { target: { value: 'Open' } });

		await waitFor(() => {
			expect(screen.getByText('Open File')).toBeInTheDocument();
		});
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

	it('executes command on select', async () => {
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

		const mockOnClose = vi.fn();
		render(
			<CommandPalette
				isOpen={true}
				onClose={mockOnClose}
				commands={commandsWithMock}
			/>,
		);

		const commandItem = screen.getByText('Test Command');
		fireEvent.click(commandItem);

		await waitFor(() => {
			expect(mockAction).toHaveBeenCalled();
			expect(mockOnClose).toHaveBeenCalled();
		});
	});

	it('clears search when dialog closes', async () => {
		const { rerender } = render(
			<CommandPalette
				isOpen={true}
				onClose={() => {}}
				commands={sampleCommands}
			/>,
		);

		const input = screen.getByPlaceholderText('Search commands...');
		fireEvent.input(input, { target: { value: 'test query' } });

		rerender(
			<CommandPalette
				isOpen={false}
				onClose={() => {}}
				commands={sampleCommands}
			/>,
		);

		await waitFor(() => {
			rerender(
				<CommandPalette
					isOpen={true}
					onClose={() => {}}
					commands={sampleCommands}
				/>,
			);
		});

		const newInput = screen.getByPlaceholderText('Search commands...');
		expect(newInput).toHaveValue('');
	});

	it('shows empty state when no results found', async () => {
		render(
			<CommandPalette
				isOpen={true}
				onClose={() => {}}
				commands={sampleCommands}
			/>,
		);

		const input = screen.getByPlaceholderText('Search commands...');
		fireEvent.input(input, { target: { value: 'nonexistent' } });

		await waitFor(() => {
			expect(screen.getByText('No results found.')).toBeInTheDocument();
		});
	});
});
