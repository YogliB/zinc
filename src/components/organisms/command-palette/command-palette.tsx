import { useMemo, useCallback } from 'preact/hooks';
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

export function CommandPalette({
	isOpen,
	onClose,
	commands,
}: CommandPaletteProperties) {
	const handleOpenChange = useCallback(
		(open: boolean) => {
			if (open === isOpen) {
				return;
			}
			onClose(open);
		},
		[isOpen, onClose],
	);

	const handleSelect = useCallback(
		(commandId: string) => {
			const command = commands.find((cmd) => cmd.id === commandId);
			if (command) {
				command.action();
				onClose(false);
			}
		},
		[commands, onClose],
	);

	const groupedCommands = useMemo(() => {
		const result: Record<string, Command[]> = {};
		for (const command of commands) {
			const category = command.category || 'General';
			if (!result[category]) {
				result[category] = [];
			}
			result[category].push(command);
		}
		return result;
	}, [commands]);

	return (
		<CommandDialog
			open={isOpen}
			onOpenChange={handleOpenChange}
			modal={true}
		>
			<CommandInput placeholder="Search commands..." />
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
