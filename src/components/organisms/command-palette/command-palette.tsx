import { signal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '../../ui/command';

interface Command {
	id: string;
	title: string;
	action: () => void;
	keywords?: string[];
	category?: string;
}

interface CommandPaletteProperties {
	isOpen: boolean;
	// eslint-disable-next-line no-unused-vars
	onClose: (shouldBeOpen: boolean) => void;
	commands: Command[];
}

const searchQuery = signal('');

export function CommandPalette({
	isOpen,
	onClose,
	commands,
}: CommandPaletteProperties) {
	useEffect(() => {
		if (!isOpen) {
			searchQuery.value = '';
		}
	}, [isOpen]);

	const handleSelect = (commandId: string) => {
		const command = commands.find((cmd) => cmd.id === commandId);
		if (command) {
			command.action();
			onClose(false);
		}
	};

	const groupedCommands: Record<string, Command[]> = {};
	for (const command of commands) {
		const category = command.category || 'General';
		if (!groupedCommands[category]) {
			groupedCommands[category] = [];
		}
		groupedCommands[category].push(command);
	}

	return (
		<CommandDialog open={isOpen} onOpenChange={onClose}>
			<CommandInput
				placeholder="Search commands..."
				value={searchQuery.value}
				onValueChange={(value) => (searchQuery.value = value)}
			/>
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				{Object.entries(groupedCommands).map(
					([category, categoryCommands]) => (
						<CommandGroup key={category} heading={category}>
							{categoryCommands.map((command) => (
								<CommandItem
									key={command.id}
									value={command.title}
									keywords={command.keywords}
									onSelect={() => handleSelect(command.id)}
								>
									{command.title}
								</CommandItem>
							))}
						</CommandGroup>
					),
				)}
			</CommandList>
		</CommandDialog>
	);
}
