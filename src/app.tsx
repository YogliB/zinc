import './app.css';

import { untracked, useSignal } from '@preact/signals';
import { Router, Route, useLocation } from 'wouter-preact';
import { invoke } from '@tauri-apps/api/core';
import { WelcomePage } from './pages';
import { EditorPage } from './pages/editor';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useEffect, useMemo, useCallback } from 'preact/hooks';
import { appMode } from './lib/stores/modes';
import { useKeyboardShortcuts } from './lib/hooks/use-keyboard-shortcuts';
import { CommandPalette } from './components/organisms/command-palette/command-palette';
import { getCommandsForContext } from './lib/commands/registry';
import { isCommandPaletteOpen } from './lib/stores/command-palette';

function App() {
	const osSignal = useSignal<'mac' | 'windows' | 'linux'>('linux');
	const [location] = useLocation();

	useEffect(() => {
		untracked(() => {
			invoke('get_os').then((result) => {
				if (result === 'macos') osSignal.value = 'mac';
				else if (result === 'windows') osSignal.value = 'windows';
				else osSignal.value = 'linux';
			});
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useKeyboardShortcuts(osSignal.value);

	useEffect(() => {
		if (location === '/') {
			appMode.value = 'welcome';
		} else if (location === '/editor') {
			appMode.value = 'editor';
		}
	}, [location]);

	const commandsForContext = getCommandsForContext(appMode.value);

	const handleDialogChange = useCallback((open: boolean) => {
		isCommandPaletteOpen.value = open;
	}, []);

	const commandsForPalette = useMemo(
		() =>
			commandsForContext.map((cmd) => ({
				id: cmd.id,
				title: cmd.title,
				action: cmd.action,
				keywords: cmd.keywords,
				category: cmd.category,
			})),
		[commandsForContext],
	);

	return (
		<TooltipProvider delayDuration={300}>
			<CommandPalette
				isOpen={isCommandPaletteOpen.value}
				onClose={handleDialogChange}
				commands={commandsForPalette}
			/>
			<Router>
				<Route path="/">
					<WelcomePage os={osSignal.value} />
				</Route>
				<Route path="/editor">
					<EditorPage />
				</Route>
			</Router>
		</TooltipProvider>
	);
}

export default App;
