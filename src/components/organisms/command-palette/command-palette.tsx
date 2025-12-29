import { signal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import Fuse from 'fuse.js';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';

interface Command {
	id: string;
	title: string;
	action: () => void;
	keywords?: string[];
	category?: string;
}

interface CommandPaletteProperties {
	isOpen: boolean;
	onClose: () => void;
	commands: Command[];
}

const searchQuery = signal('');
const selectedIndex = signal(0);

export function CommandPalette({
	isOpen,
	onClose,
	commands,
}: CommandPaletteProperties) {
	const fuse = new Fuse(commands, {
		keys: ['title', 'keywords', 'category'],
		threshold: 0.1,
		includeScore: true,
	});

	const filteredCommands = searchQuery.value
		? fuse.search(searchQuery.value).map((result) => result.item)
		: commands;

	const inputReference = useRef<HTMLInputElement>(null);

	useEffect(() => {
		selectedIndex.value = 0;
	}, [filteredCommands.length]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (!isOpen) return;

			switch (event.key) {
				case 'ArrowDown': {
					event.preventDefault();
					selectedIndex.value =
						(selectedIndex.value + 1) % filteredCommands.length;
					break;
				}
				case 'ArrowUp': {
					event.preventDefault();
					selectedIndex.value =
						selectedIndex.value === 0
							? filteredCommands.length - 1
							: selectedIndex.value - 1;
					break;
				}
				case 'Enter': {
					event.preventDefault();
					if (filteredCommands[selectedIndex.value]) {
						filteredCommands[selectedIndex.value].action();
						onClose();
					}
					break;
				}
				case 'Escape': {
					event.preventDefault();
					onClose();
					break;
				}
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [isOpen, filteredCommands, onClose]);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Command Palette</DialogTitle>
				</DialogHeader>
				<Input
					ref={inputReference}
					placeholder="Search commands..."
					value={searchQuery.value}
					onChange={(event) =>
						(searchQuery.value = (
							event.target as HTMLInputElement
						).value)
					}
				/>
				<div className="max-h-64 overflow-y-auto">
					{filteredCommands.map((command, index) => (
						<Button
							key={command.id}
							data-command-index={index}
							variant="ghost"
							className={`w-full justify-start ${index === selectedIndex.value ? 'bg-accent' : ''}`}
							onClick={() => {
								command.action();
								onClose();
							}}
						>
							{command.title}
						</Button>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}
