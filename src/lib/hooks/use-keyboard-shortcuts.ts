import { useEffect } from 'preact/hooks';
import { isCommandPaletteOpen } from '../stores/command-palette';

export function useKeyboardShortcuts(os: 'mac' | 'windows' | 'linux') {
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const isCmdOrCtrl = os === 'mac' ? event.metaKey : event.ctrlKey;
			const isK = event.key === 'k' || event.key === 'K';

			if (isCmdOrCtrl && isK) {
				event.preventDefault();
				event.stopPropagation();
				isCommandPaletteOpen.value = !isCommandPaletteOpen.value;
			} else if (event.key === 'Escape' && isCommandPaletteOpen.value) {
				event.preventDefault();
				event.stopPropagation();
				isCommandPaletteOpen.value = false;
			}
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [os]);
}
