import { invoke } from '@tauri-apps/api/core';
import { WelcomeScreen } from '../../components/templates';
import { useLocation } from 'wouter-preact';

interface WelcomePageProperties {
	os: 'mac' | 'windows' | 'linux';
}

export function WelcomePage({ os }: WelcomePageProperties) {
	const [, navigate] = useLocation();

	const handleOpenProject = async () => {
		try {
			const selected = await invoke('open_folder');
			if (selected) {
				const selectedPath = selected as string;
				navigate(`/editor?path=${encodeURIComponent(selectedPath)}`);
			}
		} catch (error) {
			console.error('Failed to open folder:', error);
		}
	};

	return <WelcomeScreen os={os} onOpenProject={handleOpenProject} />;
}
